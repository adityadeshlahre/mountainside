import { Button } from "@repo/ui/button";
import React from "react";
import VideoChat from "../components/VideoChat";

const Landing: React.FC = () => {
  return (
    <>
      <div className="text-8xl">WebSocket Quick Start</div>
      <Button
        appName="APP BUTTON CLICKED"
        className="text-6xl bg-lime-200 m-2 border-2 rounded-2xl border-lime-500 hover:bg-lime-300 hover:border-lime-600"
      >
        CLICK
      </Button>
      <VideoChat />
    </>
  );
};

export default Landing;
