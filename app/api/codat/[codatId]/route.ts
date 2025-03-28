import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {aiDesc} from "@/lib/codatAIDescription";
import {aiFunc} from "@/lib/codatAIFunction";
import { currentProfile } from "@/lib/current-profile";

export async function GET(req: NextRequest, { params }:  { params: Promise<{codatId: string}>}) {
  try {
    const { codatId } = await params;

    if (!codatId) {
      return NextResponse.json(
        { error: "Codat ID is required" },
        { status: 403 }
      );
    }

    const codat = await db.codat.findUnique({
      where: { codatId },
      include: {
        codatAuthor: {
          select: {
            id: true,
            name: true,
            image: true,
            email:true
          },
        },
      },
    });

    if (!codat) {
      return NextResponse.json(
        { error: "Codat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(codat, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: `Internal Server error: ${e}` },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }:  { params: Promise<{codatId: string}>}) {
  try {
    // const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    // if (!token) {
    //   return NextResponse.json({ error: "Unauthorized: Token missing" }, { status: 401 });
    // }
    // console.log(token);
    
    // const user = await db.profile.findUnique({
    //   where: { token },
    //   select: { id: true, name: true }
    // });
    
    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    //}

    const user=await currentProfile();
    if(!user){
      return NextResponse.json("user not found")
    }
    
    const { codatId } = await params;
    if (!codatId) {
      return NextResponse.json({ error: "Bad Request: Missing codatId" }, { status: 400 });
    }

    
    
    //console.log(user.id);
    
    
    const codat = await db.codat.findFirst({
      where: { codatId, authorId: user.id }
    });
    
    if (!codat) {
      return NextResponse.json({ error: "Forbidden: You are not the author of this Codat" }, { status: 403 });
    }
    
    const rawBody = await req.text();
    let requestBody;
    try {
      requestBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    
    const { code, language, description, title,isPublic, likes } = requestBody;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    
    if (language) updateData.codatLanguage = language;
    if (description) updateData.codatDescription = description;
    if (title) updateData.codatName = title;

    if(isPublic!==undefined){
      updateData.codatIsPublic=isPublic;
    }
    if(likes) updateData.codatLikes=likes;
    
    if (code) {
      const aiDescription = await aiDesc(code, language) || '';
      const aiFunction = await aiFunc(code, language) || '';
      
      updateData.codatCode = code;
      updateData.codatAIDesc = aiDescription;
      updateData.codatAIFunc = aiFunction;
      
      const aiSearcherData = await db.aiSearcher.findUnique({
        where: { attachedProfileId: user.id },
        select: { textToPassToAI: true }
      });
      console.log("after aiSearcherData");
      
      
      const currentData = aiSearcherData?.textToPassToAI
        ? JSON.parse(JSON.stringify(aiSearcherData.textToPassToAI))
        : [];
      console.log("after currentData");
      await db.aiSearcher.update({
        where: { attachedProfileId: user.id },
        data: {
          textToPassToAI: JSON.stringify([
            ...currentData,
            { id: codat.codatId, text: aiDescription }
          ])
        }
      });
    }
    //console.log("after update");
    
    const updatedCodat = await db.codat.update({
      where: { codatId },
      data: updateData
    });
    //console.log("updated succesfully",codat)
    return NextResponse.json({
      message: "Codat updated successfully",
      codat: updatedCodat
    });
    
  } catch (error) {
    console.error("Error updating Codat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

