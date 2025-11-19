import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import { useEffect, useState } from "react";
import useAuth from "./useAuth";

const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(firestore, "notifications"),
      where("recipientId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotifications(data);
    });

    return () => unsub();
  }, [user]);

  return { notifications };
};

export default useNotifications;
