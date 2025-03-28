import { useState, useEffect } from "react";

const useNotifications = () => {

    const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);

    useEffect(() => {
        if(!("Notification" in window)){
            alert("Este navegador no soporta notificaciones.");
        }
    }, []);

    const requestPermission = () => {
        Notification.requestPermission().then((permission) =>{
            setPermission(permission)
        })
    }

    const showNotification = (title: string, body: any) => {
        if (permission === "granted"){
            new Notification(title, {
                body
            })
        }
    }

    return { permission, requestPermission, showNotification }
}

export default useNotifications;