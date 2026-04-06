"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Trash2 } from "lucide-react";
import { getPusherClient } from "@/lib/pusher";
import { getNotifications, markNotificationsAsRead, deleteNotification } from "@/lib/actions/notification.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { PostDetailDialog } from "@/components/feed/PostDetailDialog";

interface NotificationsDropdownProps {
  userId: string;
}

export function NotificationsDropdown({ userId }: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getNotifications().then((res) => {
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.notifications.filter((n: any) => !n.read).length);
      }
    });

    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `private-${userId}`;
    const channel = pusher.bind_global((eventName: string, data: any) => {
      console.log("Global event:", eventName, data);
    });

    const privateChannel = pusher.subscribe(channelName);

    privateChannel.bind("new:notification", (newNotif: any) => {
      // Trigger badge animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);

      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      pusher.unsubscribe(channelName);
      pusher.unbind_global();
    };
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      if (unreadCount > 0) {
        setUnreadCount(0);
        markNotificationsAsRead();
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true }))
        );
      }
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notif: any) => {
    setIsOpen(false);
    if (notif.type === "FOLLOW") {
      router.push(`/profile/${notif.issuerId}`);
    } else if (notif.postId) {
      setSelectedPostId(notif.postId);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notifId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic UI delete
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    await deleteNotification(notifId);
  };

  const getNotificationText = (type: string, name: string) => {
    switch (type) {
      case "LIKE": return <span><span className="font-semibold">{name}</span> le ha dado me gusta a tu publicación.</span>;
      case "FOLLOW": return <span><span className="font-semibold">{name}</span> ha comenzado a seguirte.</span>;
      case "COMMENT": return <span><span className="font-semibold">{name}</span> comentó tu publicación.</span>;
      default: return <span>Nueva notificación de {name}</span>;
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={handleToggle}
          className={`relative p-2 rounded-full transition-all hover:bg-zinc-100 ${isOpen ? "bg-zinc-100" : ""}`}
        >
          <Bell className={`w-5 h-5 text-zinc-700 ${isAnimating ? "animate-[bell-ring_1s_ease-out]" : ""}`} />
          {unreadCount > 0 && (
            <span
              className={`absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full border border-white ${isAnimating ? "animate-ping" : ""}`}
            />
          )}
        </button>

        {isOpen && (
          <div
            className="fixed inset-x-4 top-24 mx-auto max-w-[calc(100vw-2rem)] md:absolute md:left-0 md:inset-x-auto md:top-full md:mt-2 md:w-80 bg-white/95 backdrop-blur-xl border border-zinc-200/50 shadow-2xl rounded-2xl overflow-hidden z-50 transform origin-top md:origin-top-left transition-all animate-in fade-in slide-in-from-top-2"
            style={{
              boxShadow: "0 20px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)"
            }}
          >
            <div className="px-4 py-3 border-b border-zinc-100 bg-white/50">
              <h3 className="font-semibold text-zinc-900" style={{ fontFamily: "var(--font-fraunces, inherit)" }}>
                Notificaciones
              </h3>
            </div>

            <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-zinc-500">
                  No tienes notificaciones
                </div>
              ) : (
                <div className="divide-y divide-zinc-50">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`relative flex items-start gap-3 p-4 cursor-pointer group hover:bg-zinc-50/80 transition-colors ${!notif.read ? "bg-pink-50/30" : ""}`}
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage src={notif.issuer?.image} />
                        <AvatarFallback className="text-xs bg-zinc-100 text-zinc-600">
                          {getInitials(notif.issuer?.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 text-sm text-zinc-700 leading-snug pt-0.5 pr-6">
                        {getNotificationText(notif.type, notif.issuer?.name || "Alguien")}
                        {/* Fecha simulada */}
                        <p className="text-xs text-zinc-400 mt-1">
                          Hace un momento
                        </p>
                      </div>

                      {notif.post?.imageUrl && (
                        <div className="w-10 h-10 shrink-0 rounded-md overflow-hidden bg-zinc-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={notif.post.imageUrl}
                            alt="Post thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(e, notif.id)}
                        className="absolute bottom-2 right-2 p-1.5 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50/50 rounded-md transition-all"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dialog renderizado fuera del dropdown para no cerrarse cuando se oculte el dropdown */}
      {selectedPostId && (
        <PostDetailDialog
          postId={selectedPostId}
          open={true}
          onOpenChange={(open) => {
            if (!open) setSelectedPostId(null);
          }}
        />
      )}
    </>
  );
}
