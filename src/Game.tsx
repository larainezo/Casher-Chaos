import { CenterLoading, GameServiceProps, GameServiceWrapper, useComponentRefresh } from "gamez";
import { useEffect, useState } from "react";
import { CashierChaos, emptyCash } from "./CashierChaos";
import { Instructions } from "./components/Instructions";

let isInstructionsShownAlready = false;

function GameComponent({ gs }: GameServiceProps) {
  const [isGameReady, setIsGameReady] = useState(false);
  const [showInstructions, setShowInstruction] = useState(!isInstructionsShownAlready);
  const [gameComplete, setGameComplete] = useState(false); 
  const refresh = useComponentRefresh();

  useEffect(() => {
    // wait for assets to be loaded
    gs.preloadAssets()
      .then(() => {
        // Start the session
        gs.startSession();

        // Initialize state with all required fields
        gs.initState({
          cash: emptyCash(),
          customer: 0,
          remainingLives: gs.getCurrLevelDetails().lives,
        });

        gs.addSessionEndListner((result) => {
          const report = gs.collectReport({
            level: gs.getCurrLevel(),
            result,
          });

          gs.saveReport(report);
          
          if (result === "success") {
            if (gs.getCurrLevel() === 0) { 
              setGameComplete(true); 
              return; 
            }
            
            gs.nextLevel();
            alert(`Level ${gs.getCurrLevel() + 1} Complete! Moving to next level...`);
            refresh();
          } else {
            alert(`Game Over: ${result}`);
            refresh(); 
          }
        });

        setIsGameReady(true);
      })
      .catch((error) => {
        console.error("Asset loading error:", error);
        alert("Failed to load game assets. Please refresh the page.");
      });

    return () => {
      gs.resetSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (showInstructions) {
    return <Instructions onStart={() => (setShowInstruction(false), (isInstructionsShownAlready = true))} />;
  } else if (!isGameReady) {
    return <CenterLoading />;
  } else if (gameComplete) { 
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-purple-400 to-purple-900">
        <h1 className="mb-4 text-6xl font-bold text-white">🎉 Congratulations! 🎉</h1>
        <p className="mb-2 text-3xl text-white">You completed all 8 levels!</p>
        <p className="text-xl text-white">You're a master cashier! 💰</p>
        <button
          onClick={() => {
            setGameComplete(false);
            isInstructionsShownAlready = false; // Reset to show instructions again
            refresh();
          }}
          className="px-8 py-4 mt-8 text-xl font-bold text-white transition-colors bg-green-600 hover:bg-green-700 rounded-xl"
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <GameServiceWrapper gs={gs}>
      <CashierChaos />
    </GameServiceWrapper>
  );
}

// whatever you do just make sure you export this
export default GameComponent;