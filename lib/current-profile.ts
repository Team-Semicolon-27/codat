import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

export const currentProfile = async() => {
    const {userId}=await auth()
    // console.log('Current user:', userId);

    if(!userId) return null;

    const profile =  await db.profile.findUnique({
        where:{
            id: userId
        }
    });
    // console.log('Current profile:', profile);

    return profile;
}