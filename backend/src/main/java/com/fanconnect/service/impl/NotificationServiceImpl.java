package com.fanconnect.service.impl;

import com.fanconnect.dto.response.NotificationResponse;
import com.fanconnect.exception.ForbiddenException;
import com.fanconnect.exception.ResourceNotFoundException;
import com.fanconnect.model.entity.Notification;
import com.fanconnect.model.entity.User;
import com.fanconnect.model.enums.NotificationType;
import com.fanconnect.model.enums.Role;
import com.fanconnect.repository.NotificationRepository;
import com.fanconnect.repository.UserRepository;
import com.fanconnect.service.NotificationService;
import com.fanconnect.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void notifyAdmins(NotificationType type, String title, String message, String entityType, Long entityId) {
        userRepository.findByRole(Role.ADMIN).forEach(admin ->
                notifyUser(admin.getId(), type, title, message, entityType, entityId)
        );
    }

    @Override
    @Transactional
    public void notifyUser(Long userId, NotificationType type, String title, String message,
                           String entityType, Long entityId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        notificationRepository.save(Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .read(false)
                .entityType(entityType)
                .entityId(entityId)
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications() {
        User user = getCurrentUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        User user = getCurrentUser();
        return notificationRepository.countByUserIdAndReadFalse(user.getId());
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        User user = getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Not your notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        User user = getCurrentUser();
        notificationRepository.markAllReadByUserId(user.getId());
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId) {
        User user = getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Not your notification");
        }

        notificationRepository.delete(notification);
    }

    @Override
    @Transactional
    public void deleteAllRead() {
        User user = getCurrentUser();
        notificationRepository.deleteByUserIdAndReadTrue(user.getId());
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .read(n.isRead())
                .entityType(n.getEntityType())
                .entityId(n.getEntityId())
                .createdAt(n.getCreatedAt())
                .build();
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            throw new ForbiddenException("Not authenticated");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ForbiddenException("User not found"));
    }
}