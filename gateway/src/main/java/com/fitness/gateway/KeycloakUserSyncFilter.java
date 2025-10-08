package com.fitness.gateway;

import com.fitness.gateway.user.SyncUserRequest;
import com.fitness.gateway.user.UserService;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.text.ParseException;

@Component
@Slf4j
@RequiredArgsConstructor
public class KeycloakUserSyncFilter implements WebFilter {

    private final UserService userService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        String token = exchange.getRequest().getHeaders().getFirst("Authorization");
        
        // Skip filter for public endpoints (signup)
        if (isPublicEndpoint(path) || token == null) {
            return chain.filter(exchange);
        }
        
        String userId = exchange.getRequest().getHeaders().getFirst("X-User-ID");
        SyncUserRequest syncUserRequest = getUserDetails(token);
        
        if (userId == null && syncUserRequest != null) {
            userId = syncUserRequest.getKeycloakId();
        }

        if (userId != null) {
            String finalUserId = userId;
            return userService.validateUser(userId)
                    .flatMap(exist -> {
                        if (!exist) {
                            if (syncUserRequest != null) {
                                return userService.syncUser(syncUserRequest)
                                        .then(Mono.empty());
                            } else {
                                return Mono.empty();
                            }
                        } else {
                            log.info("User already exist, Skipping sync");
                            return Mono.empty();
                        }
                    })
                    .then(Mono.defer(() -> {
                        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                                .header("X-User-ID", finalUserId)
                                .build();
                        return chain.filter(exchange.mutate().request(mutatedRequest).build());
                    }));
        }

        return chain.filter(exchange);
    }
    
    private boolean isPublicEndpoint(String path) {
        return path.equals("/api/v1/users/signup") || 
               path.startsWith("/actuator/");
    }

    private SyncUserRequest getUserDetails(String token) {
        try {
            String tokenWithoutBearer = token.replace("Bearer", "").trim();
            SignedJWT signedJWT = SignedJWT.parse(tokenWithoutBearer);
            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();

            return SyncUserRequest.builder()
                    .email(claims.getStringClaim("email"))
                    .keycloakId(claims.getSubject())
                    .firstName(claims.getStringClaim("given_name"))
                    .lastName(claims.getStringClaim("family_name"))
                    // Set a default password or generate a random one since it's required
                    .password("DefaultPassword123!") // In a real application, consider generating a secure random
                    .build();
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
    }
}