import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import io, { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

// Socket.on("statusUpdate", (data: any) => {
//     console.log("test");
// });

export default function DragDrop() {
    const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap>>();
    const [file, setFile] = useState(null);

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

    const sendFile = async (file: any) => {
        let fd = new FormData();

        fd.append("file", file);

        try {
            const res = await axios.post("http://localhost:3002/upload", fd, {
                headers: {
                    Authorization: socket?.id,
                },
            });
            console.log(res);
            console.log(res.data.message);
            console.log(res.data.status);
        } catch (err) {
            console.error(err);
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    useEffect(() => {
        const newSocket = io(`http://${window.location.hostname}:3002`);
        setSocket(newSocket);
        return () => newSocket.close();
    }, [setSocket]);

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
            <div className="mt-20 bg-[#1F2743] text-[#FEFDFA] py-4 px-8 cursor-pointer flex justify-center items-center text-center w-[30%]" onClick={() => sendFile(file)}>
                <div className='flex justify-center items-center'>
                    Convert
                </div>
            </div>
        </div>
    )
}