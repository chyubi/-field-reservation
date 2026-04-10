package com.fieldreservation.backend;

import com.fieldreservation.backend.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class FieldReservationBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(FieldReservationBackendApplication.class, args);
    }
}
