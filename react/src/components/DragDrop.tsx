import axios from 'axios';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import io, { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import LoadingBar from 'react-top-loading-bar';

export default function DragDrop() {
    const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap>>();
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0)

    const onDrop = useCallback((acceptedFiles: any) => {
        acceptedFiles.forEach((file: any) => {
            const reader = new FileReader()

            setFile(file);

            reader.onabort = () => console.log('file reading was aborted')
            reader.onerror = () => console.log('file reading has failed')
            reader.onload = () => {
                const binaryStr = reader.result
                console.log(binaryStr)
            }
            reader.readAsArrayBuffer(file)
        })

    }, [])

    const dwnBtnRef = useRef<HTMLAnchorElement>()
    const ulList = useRef<HTMLUListElement>();

    function log(message: any, type: any) {
        console.log(message, type);
        let item = document.createElement("li");
        item.className = "list-group-item";
        item.innerHTML = message;
        item.style.color =
            type === "success"
                ? "green"
                : type === "error"
                    ? "red"
                    : type === "info"
                        ? "blue"
                        : "lightgray";
        if (ulList.current) {
            ulList.current.appendChild(item);
            ulList.current.scrollTop =
                ulList.current.scrollHeight;
        }
    }



    const sendFile = async (file: any) => {
        let fd = new FormData();

        fd.append("file", file);

        try {
            const res = await axios.post("https://api.vscodethemeconverter.ostepop.site/upload", fd, {
                headers: {
                    Authorization: socket?.id ? socket?.id : "",
                },
            });
            console.log(res);
            console.log(res.data.message);
            console.log(res.data.status);

            if (dwnBtnRef.current && res.data.data.url) {
                dwnBtnRef.current.href = res.data.data.url;
                // dwnBtnRef.current.click();
            }

        } catch (err) {
            console.error(err);
            log(err?.response?.data?.message, err?.response?.data?.status);
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    useEffect(() => {
        if (!socket) return console.log("no socket");
        socket.on("statusUpdate", (data) => {
            console.log(data)
            if (!data.message.includes("Connection established to server")) {
                setProgress(v => v + 10)
            }
            // log(data.message, data.status);
        });

    }, [socket])

    useEffect(() => {
        const newSocket = io(`https://api.vscodethemeconverter.ostepop.site`)
        if (newSocket) {
            setSocket(newSocket);
        }

        return () => { if (socket) { socket.close() } }
    }, []);

    return (
        <div className='flex justify-center items-center flex-col'>
            <div {...getRootProps()} className="flex justify-center items-center flex-col">
                <div className='py-16 px-32 border-dashed border-2 border-[#1F2743] mt-[80px] cursor-pointer'>

                    <input {...getInputProps()} />
                    {
                        isDragActive ?
                            <div className='flex justify-center items-center flex-col'>
                                <div>
                                    <img src="../src/img/upl-icon.png" alt="" />
                                </div>
                                <div>
                                    <p className="opacity-[.5]">
                                        Click or drop your .JSON file here
                                    </p>
                                </div>

                            </div>
                            :
                            <div className='flex justify-center items-center flex-col'>
                                <div>
                                    <img src="../src/img/upl-icon.png" alt="" />
                                </div>
                                <div>
                                    <p className="opacity-[.5]">
                                        Click or drop your .JSON file here
                                    </p>
                                </div>

                            </div>

                    }
                </div>
            </div>
            <div>
                <LoadingBar
                    color='#47ADF3'
                    progress={progress}
                    onLoaderFinished={() => setProgress(0)}
                    height={5}
                />
            </div>
            <div className="mt-20 bg-[#1F2743] text-[#FEFDFA] py-4 px-8 cursor-pointer flex justify-center items-center text-center w-[30%]" onClick={() => sendFile(file)}>
                <div className='flex justify-center items-center'>
                    Convert
                </div>
            </div>
            <a ref={dwnBtnRef} id='downloadLink' href=""></a>
            <ul ref={ulList}>

            </ul>
        </div>
    )
}