import React from 'react';
import { Bell, CheckCircle, AlertCircle, Calendar, DollarSign } from 'lucide-react';

const notifications = [
  { id: 1, type: 'success', icon: CheckCircle, title: 'Attendance Marked', message: 'Your attendance was successfully marked for today.', time: '2 hours ago' },
  { id: 2, type: 'warning', icon: AlertCircle, title: 'Leave Request Pending', message: 'Your leave request is pending admin approval.', time: '1 day ago' },
  { id: 3, type: 'info', icon: Calendar, title: 'Upcoming Holiday', message: 'Office will be closed on December 25th for Christmas.', time: '2 days ago' },
  { id: 4, type: 'success', icon: DollarSign, title: 'Salary Credited', message: 'Your November salary has been credited to your account.', time: '5 days ago' },
];

const NotificationsPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center">
          <Bell className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated with latest activities</p>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map((notif) => {
          const colorClasses = {
            success: 'bg-success/10 text-success border-success/20',
            warning: 'bg-warning/10 text-warning border-warning/20',
            info: 'bg-primary/10 text-primary border-primary/20',
          };

          return (
            <div 
              key={notif.id} 
              className="bg-card border border-border rounded-2xl p-5 shadow-card hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${colorClasses[notif.type as keyof typeof colorClasses]}`}>
                  <notif.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-foreground">{notif.title}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{notif.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">You're all caught up!</p>
      </div>
    </div>
  );
};

export default NotificationsPage;
