import React from 'react';
import { Bell, Send, Zap } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';

const NotificationTester: React.FC = () => {
  const { isConnected, sendMessage } = useWebSocket();

  const testNotifications = [
    {
      title: "New Task Available",
      message: "A new React development task is available",
      type: "new_task",
      priority: "medium" as const,
      task_id: 123
    },
    {
      title: "Task Assigned",
      message: "You have been assigned to 'Build Landing Page'",
      type: "task_assigned",
      priority: "high" as const,
      task_id: 456
    },
    {
      title: "New Review Received",
      message: "You received a 5-star review from John Doe",
      type: "new_review",
      priority: "medium" as const,
      review_id: 789
    },
    {
      title: "Achievement Unlocked!",
      message: "Congratulations! You unlocked 'First Task'",
      type: "achievement_unlocked",
      priority: "high" as const,
      achievement_id: 101
    },
    {
      title: "New Message",
      message: "New message in 'Project Discussion' chat",
      type: "new_message",
      priority: "medium" as const,
      chat_id: 202
    }
  ];

  const sendTestNotification = (notification: any) => {
    if (!isConnected) {
      alert('WebSocket is not connected!');
      return;
    }

    // Отправляем тестовое уведомление через WebSocket
    sendMessage({
      type: 'notification',
      data: notification
    });

    console.log('Test notification sent:', notification);
  };

  const sendPing = () => {
    sendMessage({
      type: 'ping',
      timestamp: Date.now()
    });
    console.log('Ping sent');
  };

  const joinTestGroup = () => {
    sendMessage({
      type: 'join_group',
      group_name: 'test_group'
    });
    console.log('Joined test group');
  };

  const leaveTestGroup = () => {
    sendMessage({
      type: 'leave_group',
      group_name: 'test_group'
    });
    console.log('Left test group');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Bell className="w-5 h-5 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          WebSocket Notification Tester
        </h2>
      </div>

      {/* Connection Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-medium">
            Status: {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Connection Controls */}
      <div className="mb-6 space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Connection Controls
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={sendPing}
            disabled={!isConnected}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Ping
          </button>
          <button
            onClick={joinTestGroup}
            disabled={!isConnected}
            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Test Group
          </button>
          <button
            onClick={leaveTestGroup}
            disabled={!isConnected}
            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Leave Test Group
          </button>
        </div>
      </div>

      {/* Test Notifications */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Test Notifications
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {testNotifications.map((notification, index) => (
            <div
              key={index}
              className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {notification.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`
                      text-xs px-2 py-1 rounded-full
                      ${notification.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}
                    `}>
                      {notification.priority}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {notification.type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => sendTestNotification(notification)}
                  disabled={!isConnected}
                  className="ml-3 p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Send test notification"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Quick Actions
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              testNotifications.forEach((notification, index) => {
                setTimeout(() => sendTestNotification(notification), index * 1000);
              });
            }}
            disabled={!isConnected}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4" />
            <span>Send All (Sequential)</span>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Instructions
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Make sure the backend server is running on port 8000</li>
          <li>• Ensure you are logged in to establish WebSocket connection</li>
          <li>• Click any notification button to send a test notification</li>
          <li>• Notifications will appear in the top-right corner</li>
          <li>• Check browser console for WebSocket message logs</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationTester; 
