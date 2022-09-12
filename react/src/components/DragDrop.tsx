import React, { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import io from 'socket.io-client';

// Socket.on("statusUpdate", (data: any) => {
//     console.log("test");
// });

export default function DragDrop() {
    const [socket, setSocket] = useState(null);

    const onDrop = useCallback((acceptedFiles: any) => {
        acceptedFiles.forEach((file: any) => {
            const reader = new FileReader()

            reader.onabort = () => console.log('file reading was aborted')
            reader.onerror = () => console.log('file reading has failed')
            reader.onload = () => {





                const binaryStr = reader.result
                console.log(binaryStr)
            }
            reader.readAsArrayBuffer(file)
        })

    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    useEffect(() => {
        const newSocket = io(`http://${window.location.hostname}:3000`);
        setSocket(newSocket);
        return () => newSocket.close();
    }, [setSocket]);

    return (
        <div {...getRootProps()} className="flex justify-center items-center flex-col py-16 px-32 border-dashed border-2 border-[#1F2743] mt-[80px] cursor-pointer ">
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
                    </div> :
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
    )
}