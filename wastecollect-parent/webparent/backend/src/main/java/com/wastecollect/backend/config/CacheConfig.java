package com.wastecollect.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;

/**
 * Configuration du cache avec Redis.
 * Active le cache et configure la sérialisation et la durée de vie des entrées.
 */
@Configuration
public class CacheConfig {

    /**
     * Configure les paramètres par défaut pour les caches Redis.
     * - Utilise GenericJackson2JsonRedisSerializer pour la sérialisation/désérialisation des objets Java en JSON dans Redis.
     * - Définit une durée de vie par défaut pour les entrées de cache (ex: 1 heure).
     */
	@Bean
	public RedisCacheConfiguration cacheConfiguration() {
	    return RedisCacheConfiguration.defaultCacheConfig()
	            .entryTtl(Duration.ofHours(1)) // Durée de vie par défaut des entrées de cache
	            .disableCachingNullValues() // Ne pas mettre en cache les valeurs nulles
	            .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));
	}
}
