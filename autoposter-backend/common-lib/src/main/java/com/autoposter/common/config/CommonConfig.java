package com.autoposter.common.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * Shared configuration to enable component scanning of common-lib package
 * across multiple services.
 */
@Configuration
@ComponentScan(basePackages = "com.autoposter.common")
public class CommonConfig {
}
