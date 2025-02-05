"use client";

import { useModel } from "@/hooks/user-model-store";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { setEditProfile } = useModel();
  const { user } = useUser();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    console.log(user);
  }, [user]);

  useEffect(() => {
    if (user) {
      setName(user.username || user.fullName || "");
      setPhoneNumber(user.phoneNumbers?.[0]?.phoneNumber || "");
      setImage(user.imageUrl || "");
    }
  }, [user]);

  if (!user) return <p>Loading...</p>;

  const handleUpdateProfile = async () => {
    try {
      const { data } = await axios.put("/api/profile/edit", {
        name,
        phoneNumber,
        image,
      });

      setEditProfile(data);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Error updating profile");
      console.error("Update error:", error);
    }
  };
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>

      <div className="mb-4">
        <label className="block font-medium">Name:</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium">Phone Number:</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium">Profile Image URL:</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
      </div>

      <button
        onClick={handleUpdateProfile}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </div>
  );
}
