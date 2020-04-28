const GAMESTATE = {
  MENU: 0,
  GAMEINPROGRESS: 1,
  GAMEOVER: 2
};
export default class Input {
  constructor(player, game) {
    document.addEventListener("keydown", event => {
      let key = event.keyCode || event.key;

      switch (key) {
        default:
          break;
        case 37:
          if (player.isVisible) player.left();
          break;
        case 39:
          if (player.isVisible) player.right();
          break;
        case 17:
          game.shootBullet(player);
          break;
        case 32:
          if (game.gameState === GAMESTATE.MENU) game.start();
          else if (game.gameState === GAMESTATE.GAMEOVER)
            game.gameState = GAMESTATE.MENU;

          break;
      }
    });

    document.addEventListener("keyup", event => {
      let key = event.keyCode || event.key;

      switch (key) {
        case 37:
          player.stop();
          break;
        case 39:
          player.stop();
          break;
      }
    });
  }
}
