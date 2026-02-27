package com.autoposter.common.utils;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

public final class DateTimeUtils {

    public static final String DEFAULT_FORMAT = "yyyy-MM-dd HH:mm:ss";
    public static final String ISO_FORMAT     = "yyyy-MM-dd'T'HH:mm:ss'Z'";

    private DateTimeUtils() {
    }

    /**
     * @return Current LocalDateTime in UTC.
     */
    public static LocalDateTime now() {
        return LocalDateTime.now(ZoneOffset.UTC);
    }

    /**
     * Formats a LocalDateTime using the default project format.
     */
    public static String format(LocalDateTime dateTime) {
        return format(dateTime, DEFAULT_FORMAT);
    }

    /**
     * Formats a LocalDateTime using a custom pattern.
     */
    public static String format(LocalDateTime dateTime, String pattern) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(DateTimeFormatter.ofPattern(pattern));
    }

    /**
     * Checks if the given time has already passed (expired).
     */
    public static boolean isExpired(LocalDateTime expiryTime) {
        if (expiryTime == null) {
            return true;
        }
        return now().isAfter(expiryTime);
    }

    /**
     * Adds minutes to a LocalDateTime. Useful for short-lived tokens.
     */
    public static LocalDateTime plusMinutes(LocalDateTime dateTime, long minutes) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.plusMinutes(minutes);
    }

    /**
     * Adds hours to a LocalDateTime. Useful for expiration logic.
     */
    public static LocalDateTime plusHours(LocalDateTime dateTime, long hours) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.plusHours(hours);
    }

    /**
     * Adds days to a LocalDateTime. Useful for refresh tokens or plan expiry.
     */
    public static LocalDateTime plusDays(LocalDateTime dateTime, long days) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.plusDays(days);
    }
}
