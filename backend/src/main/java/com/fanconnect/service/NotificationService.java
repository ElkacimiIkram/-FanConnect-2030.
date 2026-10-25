package com.fanconnect.service;

import com.fanconnect.dto.response.NotificationResponse;
import com.fanconnect.model.enums.NotificationType;

import java.util.List;

public interface NotificationService {

    void notifyAdmins(NotificationType type, String title, String message, String entityType, Long entityId);

    void notifyUser(Long userId, NotificationType type, String title, String message, String entityType, Long entityId);

    List<NotificationResponse> getMyNotifications();

    void markAsRead(Long notificationId);

    void markAllAsRead();

    void deleteNotification(Long notificationId);

    void deleteAllRead();

    long getUnreadCount();
}