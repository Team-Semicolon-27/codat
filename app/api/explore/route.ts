import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(){
    const profile=await currentProfile();
    const userId=profile?.id;

    const allCodatTags = await db.codat.findMany({
        select: {
          codatTags: true,
        },
        where: {
          codatIsPublic: true,
        },
      });
    
      const allTags = [
        ...new Set(allCodatTags.flatMap((codat) => codat.codatTags)),
      ];


      if(!profile){
        const isGuest=true;
        return NextResponse.json({allTags,isGuest},{status:200})
      }

      const createdCodats = await db.codat.findMany({
        where: { authorId: userId },
        select: { codatTags: true },
      });
    
      const savedCodats = await db.profile.findUnique({
        where: { id: userId },
        select: { codatsSaved: { select: { codatTags: true } } },
      });
    
      const createdCodatTags = createdCodats
        ? [...new Set(createdCodats.flatMap((codat) => codat.codatTags))]
        : [];
      const savedCodatTags = savedCodats
        ? [...new Set(savedCodats.codatsSaved.flatMap((codat) => codat.codatTags))]
        : [];
    
      const userTags = [...new Set([...createdCodatTags, ...savedCodatTags])];
    
      const recommendedCodats = await db.codat.findMany({
        where: {
          codatTags: { hasSome: userTags },
          codatIsPublic: true,
          authorId: { not: userId },
        },
        select: {
          codatId: true,
          codatName: true,
          codatTags: true,
          codatDescription: true,
          codatLikes: true,
          codatCode: true,
          codatLanguage: true,
          codatAIDesc: true,
          codatAuthor: true,
        },
        orderBy: { codatLikes: "desc" },
        take: 10,
      });

      const isGuest=false;

      return NextResponse.json({createdCodatTags,savedCodatTags,recommendedCodats,allTags,isGuest})


}