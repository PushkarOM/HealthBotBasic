import React, { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import { HfInference } from '@huggingface/inference'
import { Skeleton } from './ui/skeleton'
const ChatSection = () => {

    const [loading,setLoading] = useState(false);
    const [chatHistory,setChatHistory] = useState([])
    const [userInput, setUserInput] = useState("")
    // const [index,setIndex] = useState(0);
    const client = new HfInference(import.meta.env.VITE_CHAT_BOT_API_KEY);

    console.log("renrender")
    //useEffect for the loader
    useEffect(()=>{
       if(userInput !== ""){
            sendChat();
       }
    },[userInput])

    const sendChat = async() => {
        const SYSTEM_PROMPT = `
            You are a knowledgeable and empathetic health advisor chatbot. Your role is to assist users in understanding their symptoms and provide basic advice or remedies to manage their condition until they can consult a healthcare professional. Your responses should be clear, concise, and reassuring.

            - Avoid making diagnoses; instead, help users identify potential concerns based on their symptoms.
            - Encourage users to seek medical attention for severe, persistent, or concerning symptoms.
            - Provide safe and general remedies for common conditions, such as hydration, rest, or over-the-counter medications, where appropriate.
            - Use simple language to explain medical concepts, avoiding overly technical terms unless necessary.
            - Do not provide advice for complex or critical conditions like heart attacks, strokes, or severe injuries; instead, advise the user to seek emergency medical care immediately.
            - Respect the user's privacy and respond with empathy, understanding the anxiety or discomfort they may feel.
            - Remind users that your guidance is not a substitute for professional medical care and that consulting a qualified doctor is always the best course of action.

            Example interactions:
            1. If the user describes symptoms like a sore throat and mild fever, suggest hydration, rest, and warm fluids, and mention they may have a viral infection. Recommend seeing a doctor if symptoms worsen or persist.
            2. If the user mentions severe chest pain, advise them to seek emergency medical help immediately, explaining why this could be serious.
            3. For mild headaches, recommend resting in a quiet place, staying hydrated, and using over-the-counter pain relief like acetaminophen, if needed.

            End each interaction with a reminder to consult a healthcare provider for a proper evaluation and treatment plan.
            `;

        let out="";

        setChatHistory((previtem) => [...previtem,{role : "user", content : userInput}])


        try {
            const stream = client.chatCompletionStream({
                model: "meta-llama/Meta-Llama-3-8B-Instruct",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userInput },
                ],
                temperature: 0.5,
                max_tokens: 2048,
                top_p: 0.7
            });
        
            for await (const chunk of stream) {
                if (chunk.choices && chunk.choices.length > 0) {
                    const newContent = chunk.choices[0].delta.content;
                    out += newContent;
                    // console.log(newContent);
                }  
            }
            setChatHistory((previtem)=>[...previtem,{role : "system", content : out}])
            console.log(out);
        } catch (err) {
            console.error(err.message)
        }
        finally{
            setLoading(false);
        }

    }

    const HandleForm = async (formData) => {
        const query = formData.get("query");
        if (!query) return;
        setUserInput(query); // Triggers `useEffect` for sending chat
        setLoading(true); // Start showing loaders
    };
    

    const chatOutput = () => {
        if (loading) {
            // Show skeleton loaders during the loading state
            return (
                <>
                    <div className='flex justify-center items-center w-full h-auto'>
                        <Skeleton className="w-full h-5 bg-slate-300 rounded-xl" />
                        <Skeleton className="w-11 h-11 m-2 bg-slate-300 rounded-full" />
                    </div>
                    <div className='flex justify-center items-center w-full h-auto'>
                        <Skeleton className="w-11 h-11 m-2 bg-slate-300 rounded-full" />
                        <Skeleton className="w-full h-5 bg-slate-300 rounded-xl" />
                    </div>
                  
                </>
            );
        }
    
        if (chatHistory.length === 0) {
            return (
                <div className="text-white text-center text-xl font-bold my-[20%]">
                    Start Chatting
                </div>
            );
        }
    
        // Render chat messages if not loading
        return chatHistory.map((item, index) => (
            
            <div
                key={index}
                className={`w-full h-auto bg-slate-800 rounded-xl flex justify-evenly ${item.role === "system" ? 'flex-row' : 'flex-row-reverse'} items-start p-4 text-white`}
            >
                <span className={` px-2 ${item.role === 'system' ? "w-[10%]" : 'text-justify w-[6%]'}`}>
                    {item.role === "system" ? "System :" : ":  User"}
                </span>
                <p className={`w-[90%] ${item.role === 'system' ? "" : 'text-right'}`}>{item.content}</p>
            </div>
        ));
    };
    
      


  return (
    <div className='w-9/12 h-full bg-slate-900 p-4 flex flex-col justify-start items-center gap-4 rounded-3xl overflow-y-auto'>
        <div className='w-full h-5/6 bg-slate-600 rounded-2xl p-4 flex flex-col gap-2 overflow-y-auto scrollbar-thumb-slate-800 scrollbar-track-slate-400 scrollbar-thin'>
                {chatOutput()}
        </div>
        <div  className='w-full h-1/6 bg-slate-600 rounded-2xl p-4 flex justify-center'>
            <div className='w-full h-auto overflow-y-auto bg-slate-800 rounded-xl flex justify-between items-center p-4'>
                <form className="w-full h-full flex justify-between items-center" action={HandleForm}>
                    <input 
                    placeholder='Ask anything ?'
                    className='w-full h-[90%] pl-4 bg-transparent text-white outline-none hover:outline-none hover:bg-transparent focus:outline-none rounded-full  transition-all mr-6 caret-white '
                    type="text" 
                    name="query"
                    />
                    <button type="submit"> 
                        <Send className="transition-all hover:scale-125 mr-1 bg-white w-10 h-9 p-1 rounded-full text-slate-950"   />
                    </button>
                
                </form>                
            </div>
        </div>
    </div>
  )
}

export default ChatSection