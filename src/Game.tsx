import { CenterLoading, GameServiceProps, GameServiceWrapper, useComponentRefresh } from "gamez";
import { useEffect, useState } from "react";
import { CashierChaos, emptyCash } from "./CashierChaos";
import { Instructions } from "./components/Instructions";

let isInstructionsShownAlready = false;

function GameComponent({ gs }: GameServiceProps) {
  const [isGameReady, setIsGameReady] = useState(false);
  const [showInstructions, setShowInstruction] = useState(!isInstructionsShownAlready);
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
          // do something when the session ends (e.g., display results, save data)
          const report = gs.collectReport({
            level: gs.getCurrLevel(),
            result,
          });

          gs.saveReport(report);
          
          if (result === "success") {
            if (gs.isGameComplete()) {
              alert("Congratulations! You completed all levels!");
            } else {
              gs.nextLevel();
              alert(`Level ${gs.getCurrLevel()} Complete! Moving to next level...`);
            }
          } else {
            alert(`Game Over: ${result}`);
          }
          
          refresh();
        });

        setIsGameReady(true);
      })
      .catch((error) => {
        // handle asset loading error
        console.error("Asset loading error:", error);
        alert("Failed to load game assets. Please refresh the page.");
      });

    return () => {
      // reset the game when component unmounts
      gs.resetSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (showInstructions) {
    return <Instructions onStart={() => (setShowInstruction(false), (isInstructionsShownAlready = true))} />;
  } else if (!isGameReady) {
    return <CenterLoading />;
  } else if (gs.isGameComplete()) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-purple-400 to-purple-900">
        <h1 className="mb-4 text-6xl font-bold text-white">🎉 Congratulations! 🎉</h1>
        <p className="text-2xl text-white">You completed all levels!</p>
        <button
          onClick={refresh}
          className="px-8 py-4 mt-8 text-xl font-bold text-white bg-green-600 rounded-xl"
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