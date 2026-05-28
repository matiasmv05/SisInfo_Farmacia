package com.farmacia.cristoredentor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing 
@EnableScheduling
@EnableAsync 
public class GestionInventarioApplication {

    private static final Logger log = LoggerFactory.getLogger(GestionInventarioApplication.class);

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(GestionInventarioApplication.class, args);
        Environment env = ctx.getEnvironment();
        String port = env.getProperty("server.port", "8080");

        log.info("Backend corriendo en: http://localhost:{}", port);
        log.info("Swagger UI:           http://localhost:{}/swagger-ui/index.html", port);
    }
}