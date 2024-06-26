import { ChatHeader } from '@/components/chat/chat-header';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessages } from '@/components/chat/chat-messages';
import { MediaRoom } from '@/components/media-room';
import { currentProfile } from '@/lib/current-profile'
import { db } from '@/lib/db'
import { redirectToSignIn } from '@clerk/nextjs';
import { ChannelType } from '@prisma/client';
import { redirect } from 'next/navigation';


interface channelIdPageProps{
    params:{
        channelId:string;
        serverId:string;
    }
}

const channelIdPage = async (

    {params}:channelIdPageProps
) => {
    const profile= await currentProfile();

    if(!profile){
        return redirectToSignIn();
    }


    const channel= await db.channel.findUnique({
      where:{
        id:params.channelId,
      }
    })

    const member= await db.member.findFirst({
        where:{
            serverId:params.serverId,
            profileId:profile.id,
        }
    })
    if(!channel || !member){
      return redirect("/");
    }

    

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      
       <ChatHeader
       serverId={params.serverId}
       name={channel?.name}
       type="channel"
       />
      {channel.type === ChannelType.TEXT && (
        <>
      <ChatMessages
            member={member}
            name={channel.name}
            chatId={channel.id}
            type="channel"
            apiUrl="/api/messages"
            socketUrl="/api/socket/messages"
            socketQuery={{
              channelId: channel.id,
              serverId: channel.serverId,
            }}
            paramKey="channelId"
            paramValue={channel.id}
          />
       
       <ChatInput
        apiUrl="/api/socket/messages"
        type="channel"
        name={channel?.name}
        query={{
          channelId:channel.id,
          serverId:params.serverId,
        }
      }
      />
      </>
      )}
       {channel.type === ChannelType.AUDIO && (
        <MediaRoom
          chatId={channel.id}
          video={false}
          audio={true}
        />
      )}
      {channel.type === ChannelType.VIDEO && (
        <MediaRoom
          chatId={channel.id}
          video={true}
          audio={true}
        />
      )}
    </div>
    
  )
}

export default channelIdPage