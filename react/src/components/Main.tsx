import { useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import DragDrop from "./DragDrop";

export default function User() {
  return (
    <div className="flex flex-col justify-center items-center h-100 text-[#1F2743]">
      <div>
        <img src="../src/img/logo.png" alt="" />
      </div>
      <div className="w-[800px] text-center mt-8 text-[18px]">
        <p>
          This service let’s you transform your favorite VS code color theme to a Visual Studio theme. Full instructions can be found at our <i><a href="https://github.com/NUB31/vscode_vs_theme_converter" className="text-[#3BA8F2] no-underline font-semibold">github repo</a></i>. There you can also find all the sources used for this project and all the contributors that have participated.
        </p>
      </div>
      <DragDrop />
    </div>
  );
}
