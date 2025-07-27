// Secure notification utilities for service worker updates and offline status
// Avoids innerHTML security vulnerabilities

interface NotificationOptions {
  title: string;
  message: string;
  type: 'update' | 'offline' | 'error';
  duration?: number;
  clickHandler?: () => void;
}

export function createSecureNotification(options: NotificationOptions): HTMLElement {
  const { title, message, type, duration = 5000, clickHandler } = options;
  
  // Create elements safely without innerHTML
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--color-${getTypeColor(type)});
    color: var(--color-background);
    padding: 12px 16px;
    border: 2px solid currentColor;
    font-family: var(--font-pixel), monospace;
    font-size: 14px;
    z-index: 9999;
    max-width: 300px;
    cursor: ${clickHandler ? 'pointer' : 'default'};
    border-radius: 0;
    box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
  `;
  
  // Add ARIA attributes for accessibility
  container.setAttribute('role', 'alert');
  container.setAttribute('aria-live', 'assertive');
  container.setAttribute('aria-labelledby', 'notification-title');
  container.setAttribute('aria-describedby', 'notification-message');
  
  // Create title element
  const titleElement = document.createElement('div');
  titleElement.id = 'notification-title';
  titleElement.style.fontWeight = 'bold';
  titleElement.textContent = getTypeIcon(type) + ' ' + title;
  
  // Create message element  
  const messageElement = document.createElement('div');
  messageElement.id = 'notification-message';
  messageElement.style.fontSize = '12px';
  messageElement.style.marginTop = '4px';
  messageElement.textContent = message;
  
  container.appendChild(titleElement);
  container.appendChild(messageElement);
  
  // Add click handler if provided
  if (clickHandler) {
    container.addEventListener('click', () => {
      clickHandler();
      removeNotification(container);
    });
  }
  
  // Add to DOM
  document.body.appendChild(container);
  
  // Auto-remove after duration
  setTimeout(() => {
    removeNotification(container);
  }, duration);
  
  return container;
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'update': return 'accent';
    case 'offline': return 'secondary';
    case 'error': return 'accent';
    default: return 'secondary';
  }
}

function getTypeIcon(type: string): string {
  switch (type) {
    case 'update': return '⚡';
    case 'offline': return '📱';
    case 'error': return '⚠️';
    default: return 'ℹ️';
  }
}

function removeNotification(element: HTMLElement): void {
  if (element.parentNode) {
    element.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    element.style.opacity = '0';
    element.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }, 300);
  }
}

// Cache status notification
export function showCacheStatusNotification(status: 'ready' | 'updating' | 'error'): void {
  const messages = {
    ready: { title: 'APP READY FOR OFFLINE USE', message: 'QRetro now works without internet!' },
    updating: { title: 'UPDATING CACHE', message: 'Getting latest version...' },
    error: { title: 'CACHE ERROR', message: 'Some features may not work offline' }
  };
  
  const config = messages[status];
  createSecureNotification({
    title: config.title,
    message: config.message,
    type: status === 'error' ? 'error' : 'offline',
    duration: status === 'updating' ? 3000 : 5000
  });
}

// Update notification with click to refresh
export function showUpdateNotification(): void {
  createSecureNotification({
    title: 'NEW VERSION AVAILABLE',
    message: 'Click to update and reload',
    type: 'update',
    duration: 10000,
    clickHandler: () => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });
      }
    }
  });
}