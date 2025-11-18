import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import './MonopolyGame.css';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const MonopolyGame = ({ gameRunning, onScoreChange, isPaused, level = 1, onLevelComplete }) => {
  const { user } = useAuth();
  const gameContainerRef = useRef(null);
  const scriptsLoadedRef = useRef(false);
  const gameInitializedRef = useRef(false);
  const [numBots, setNumBots] = useState(3);
  const [showSetup, setShowSetup] = useState(true);
  const [currentScore, setCurrentScore] = useState(0);
  const [playMode, setPlayMode] = useState(null); // 'online' or 'computer'
  const [socket, setSocket] = useState(null);

  // Initialize socket for online play
  useEffect(() => {
    if (gameRunning && !isPaused) {
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Connected to Monopoly game server');
      });

      newSocket.on('monopoly-state', (state) => {
        // Handle online game state updates
        console.log('Monopoly state update:', state);
        // For online mode, we would update the game state here
        // For now, online mode will use the same interface
      });

      newSocket.on('monopoly-message', (data) => {
        console.log('Monopoly message:', data.message);
        // Could show toast notifications here
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [gameRunning, isPaused]);

  useEffect(() => {
    if (!gameRunning || isPaused) return;

    // Load monopoly game scripts
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const loadStyles = (href) => {
      return new Promise((resolve) => {
        // Check if already loaded
        const existing = document.querySelector(`link[href="${href}"]`);
        if (existing) {
          resolve();
          return;
        }
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = resolve;
        document.head.appendChild(link);
      });
    };

    const initializeGame = async () => {
      try {
        // Load jQuery first (required by monopoly game)
        if (!window.jQuery) {
          await loadScript('https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js');
        }
        
        // Load styles first
        await loadStyles('/monopoly-styles.css');
        
        // Load scripts in order
        await loadScript('/classicedition.js');
        await loadScript('/ai.js');
        await loadScript('/monopoly.js');
        
        scriptsLoadedRef.current = true;
        
        // Create game container HTML
        if (gameContainerRef.current) {
          gameContainerRef.current.innerHTML = `
            <div id="popupbackground"></div>
            <div id="popupwrap">
              <div id="popup">
                <div style="position: relative;">
                  <div id="popuptext"></div>
                  <div id="popupdrag"></div>
                </div>
              </div>
            </div>

            <div id="statsbackground"></div>
            <div id="statswrap">
              <div id="stats">
                <div style="position: relative;">
                  <img id="statsclose" src="/monopoly-images/close.png" title="Close" alt="x" />
                  <div id="statstext"></div>
                  <div id="statsdrag"></div>
                </div>
              </div>
            </div>

            <div id="deed">
              <div id="deed-normal" style="display: none;">
                <div id="deed-header">
                  <div style="margin: 5px; font-size: 11px;">T I T L E&nbsp;&nbsp;D E E D</div>
                  <div id="deed-name"></div>
                </div>
                <table id="deed-table">
                  <tr>
                    <td colspan="2">RENT&nbsp;$<span id="deed-baserent">12</span>.</td>
                  </tr>
                  <tr>
                    <td style="text-align: left;">With 1 House</td>
                    <td style="text-align: right;">$&nbsp;&nbsp;&nbsp;<span id="deed-rent1">60</span>.</td>
                  </tr>
                  <tr>
                    <td style="text-align: left;">With 2 Houses</td>
                    <td style="text-align: right;"><span id="deed-rent2">180</span>.</td>
                  </tr>
                  <tr>
                    <td style="text-align: left;">With 3 Houses</td>
                    <td style="text-align: right;"><span id="deed-rent3">500</span>.</td>
                  </tr>
                  <tr>
                    <td style="text-align: left;">With 4 Houses</td>
                    <td style="text-align: right;"><span id="deed-rent4">700</span>.</td>
                  </tr>
                  <tr>
                    <td colspan="2">
                      <div style="margin-bottom: 8px;">With HOTEL $<span id="deed-rent5">900</span>.</div>
                      <div>Mortgage Value $<span id="deed-mortgage">80</span>.</div>
                      <div>Houses cost $<span id="deed-houseprice">100</span>. each</div>
                      <div>Hotels, $<span id="deed-hotelprice">100</span>. plus 4 houses</div>
                    </td>
                  </tr>
                </table>
              </div>
              <div id="deed-mortgaged">
                <div id="deed-mortgaged-name"></div>
                <p>&bull;</p>
                <div>MORTGAGED</div>
                <div> for $<span id="deed-mortgaged-mortgage">80</span></div>
              </div>
              <div id="deed-special">
                <div id="deed-special-name"></div>
                <div id="deed-special-text"></div>
                <div id="deed-special-footer">
                  Mortgage Value
                  <span style="float: right;">$<span id="deed-special-mortgage">100</span>.</span>
                </div>
              </div>
            </div>

            <table id="board">
              <tr>
                <td class="cell board-corner" id="cell20"></td>
                <td class="cell board-top" id="cell21"></td>
                <td class="cell board-top" id="cell22"></td>
                <td class="cell board-top" id="cell23"></td>
                <td class="cell board-top" id="cell24"></td>
                <td class="cell board-top" id="cell25"></td>
                <td class="cell board-top" id="cell26"></td>
                <td class="cell board-top" id="cell27"></td>
                <td class="cell board-top" id="cell28"></td>
                <td class="cell board-top" id="cell29"></td>
                <td class="cell board-corner" id="cell30"></td>
              </tr>
              <tr>
                <td class="cell board-left" id="cell19"></td>
                <td colspan="9" class="board-center"></td>
                <td class="cell board-right" id="cell31"></td>
              </tr>
              <tr>
                <td class="cell board-left" id="cell18"></td>
                <td colspan="9" class="board-center"></td>
                <td class="cell board-right" id="cell32"></td>
              </tr>
              <tr>
                <td class="cell board-left" id="cell17"></td>
                <td colspan="9" class="board-center"></td>
                <td class="cell board-right" id="cell33"></td>
              </tr>
              <tr>
                <td class="cell board-left" id="cell16"></td>
                <td colspan="9" class="board-center"></td>
                <td class="cell board-right" id="cell34"></td>
              </tr>
              <tr>
                <td class="cell board-left" id="cell15"></td>
                <td colspan="9" class="board-center"></td>
                <td class="cell board-right" id="cell35"></td>
              </tr>
              <tr>
                <td class="cell board-left" id="cell14"></td>
                <td colspan="9" class="board-center"></td>
                <td class="cell board-right" id="cell36"></td>
              </tr>
              <tr>
                <td class="cell board-left" id="cell13"></td>
                <td colspan="9" class="board-center"></td>
                <td class="cell board-right" id="cell37"></td>
              </tr>
              <tr>
                <td class="cell board-left" id="cell12"></td>
                <td colspan="9" class="board-center"></td>
                <td class="cell board-right" id="cell38"></td>
              </tr>
              <tr>
                <td class="cell board-left" id="cell11"></td>
                <td colspan="9" class="board-center">
                  <div id="jail"></div>
                </td>
                <td class="cell board-right" id="cell39"></td>
              </tr>
              <tr>
                <td class="cell board-corner" id="cell10"></td>
                <td class="cell board-bottom" id="cell9"></td>
                <td class="cell board-bottom" id="cell8"></td>
                <td class="cell board-bottom" id="cell7"></td>
                <td class="cell board-bottom" id="cell6"></td>
                <td class="cell board-bottom" id="cell5"></td>
                <td class="cell board-bottom" id="cell4"></td>
                <td class="cell board-bottom" id="cell3"></td>
                <td class="cell board-bottom" id="cell2"></td>
                <td class="cell board-bottom" id="cell1"></td>
                <td class="cell board-corner" id="cell0"></td>
              </tr>
            </table>

            <div id="moneybarwrap">
              <div id="moneybar">
                <table>
                  <tr id="moneybarrow1" class="money-bar-row">
                    <td class="moneybararrowcell"><img src="/monopoly-images/arrow.png" id="p1arrow" class="money-bar-arrow" alt=">"/></td>
                    <td id="p1moneybar" class="moneybarcell">
                      <div><span id="p1moneyname">Player 1</span>:</div>
                      <div>$<span id="p1money">1500</span></div>
                    </td>
                  </tr>
                  <tr id="moneybarrow2" class="money-bar-row">
                    <td class="moneybararrowcell"><img src="/monopoly-images/arrow.png" id="p2arrow" class="money-bar-arrow" alt=">" /></td>
                    <td id="p2moneybar" class="moneybarcell">
                      <div><span id="p2moneyname">Player 2</span>:</div>
                      <div>$<span id="p2money">1500</span></div>
                    </td>
                  </tr>
                  <tr id="moneybarrow3" class="money-bar-row">
                    <td class="moneybararrowcell"><img src="/monopoly-images/arrow.png" id="p3arrow" class="money-bar-arrow" alt=">" /></td>
                    <td id="p3moneybar" class="moneybarcell">
                      <div><span id="p3moneyname">Player 3</span>:</div>
                      <div>$<span id="p3money">1500</span></div>
                    </td>
                  </tr>
                  <tr id="moneybarrow4" class="money-bar-row">
                    <td class="moneybararrowcell"><img src="/monopoly-images/arrow.png" id="p4arrow" class="money-bar-arrow" alt=">" /></td>
                    <td id="p4moneybar" class="moneybarcell">
                      <div><span id="p4moneyname">Player 4</span>:</div>
                      <div>$<span id="p4money">1500</span></div>
                    </td>
                  </tr>
                  <tr id="moneybarrow5" class="money-bar-row">
                    <td class="moneybararrowcell"><img src="/monopoly-images/arrow.png" id="p5arrow" class="money-bar-arrow" alt=">" /></td>
                    <td id="p5moneybar" class="moneybarcell">
                      <div><span id="p5moneyname">Player 5</span>:</div>
                      <div>$<span id="p5money">1500</span></div>
                    </td>
                  </tr>
                  <tr id="moneybarrow6" class="money-bar-row">
                    <td class="moneybararrowcell"><img src="/monopoly-images/arrow.png" id="p6arrow" class="money-bar-arrow" alt=">" /></td>
                    <td id="p6moneybar" class="moneybarcell">
                      <div><span id="p6moneyname">Player 6</span>:</div>
                      <div>$<span id="p6money">1500</span></div>
                    </td>
                  </tr>
                  <tr id="moneybarrow7" class="money-bar-row">
                    <td class="moneybararrowcell"><img src="/monopoly-images/arrow.png" id="p7arrow" class="money-bar-arrow" alt=">" /></td>
                    <td id="p7moneybar" class="moneybarcell">
                      <div><span id="p7moneyname">Player 7</span>:</div>
                      <div>$<span id="p7money">1500</span></div>
                    </td>
                  </tr>
                  <tr id="moneybarrow8" class="money-bar-row">
                    <td class="moneybararrowcell"><img src="/monopoly-images/arrow.png" id="p8arrow" class="money-bar-arrow" alt=">" /></td>
                    <td id="p8moneybar" class="moneybarcell">
                      <div><span id="p8moneyname">Player 8</span>:</div>
                      <div>$<span id="p8money">1500</span></div>
                    </td>
                  </tr>
                  <tr id="moneybarrowbutton">
                    <td class="moneybararrowcell">&nbsp;</td>
                    <td style="border: none;">
                      <input type="button" id="viewstats" value="View stats" />
                    </td>
                  </tr>
                </table>
              </div>
            </div>

            <div id="setup" style="display: none;">
              <div style="margin-bottom: 20px;">
                Select number of players.
                <select id="playernumber" title="Select the number of players for the game.">
                  <option>2</option>
                  <option>3</option>
                  <option selected="selected">4</option>
                  <option>5</option>
                  <option>6</option>
                  <option>7</option>
                  <option>8</option>
                </select>
              </div>
              <div id="player1input" class="player-input">
                Player 1: <input type="text" id="player1name" title="Player name" maxlength="16" value="Player 1" />
                <select id="player1color" title="Player color">
                  <option style="color: aqua;">Aqua</option>
                  <option style="color: black;">Black</option>
                  <option style="color: blue;">Blue</option>
                  <option style="color: fuchsia;">Fuchsia</option>
                  <option style="color: gray;">Gray</option>
                  <option style="color: green;">Green</option>
                  <option style="color: lime;">Lime</option>
                  <option style="color: maroon;">Maroon</option>
                  <option style="color: navy;">Navy</option>
                  <option style="color: olive;">Olive</option>
                  <option style="color: orange;">Orange</option>
                  <option style="color: purple;">Purple</option>
                  <option style="color: red;">Red</option>
                  <option style="color: silver;">Silver</option>
                  <option style="color: teal;">Teal</option>
                  <option selected="selected" style="color: yellow;">Yellow</option>
                </select>
                <select id="player1ai" title="Choose whether this player is controled by a human or by the computer.">
                  <option value="0" selected="selected">Human</option>
                  <option value="1">AI (Test)</option>
                </select>
              </div>
              <div id="player2input" class="player-input">
                Player 2: <input type="text" id="player2name" title="Player name" maxlength="16" value="Player 2" />
                <select id="player2color" title="Player color">
                  <option style="color: aqua;">Aqua</option>
                  <option style="color: black;">Black</option>
                  <option selected="selected" style="color: blue;">Blue</option>
                  <option style="color: fuchsia;">Fuchsia</option>
                  <option style="color: gray;">Gray</option>
                  <option style="color: green;">Green</option>
                  <option style="color: lime;">Lime</option>
                  <option style="color: maroon;">Maroon</option>
                  <option style="color: navy;">Navy</option>
                  <option style="color: olive;">Olive</option>
                  <option style="color: orange;">Orange</option>
                  <option style="color: purple;">Purple</option>
                  <option style="color: red;">Red</option>
                  <option style="color: silver;">Silver</option>
                  <option style="color: teal;">Teal</option>
                  <option style="color: yellow;">Yellow</option>
                </select>
                <select id="player2ai" title="Choose whether this player is controled by a human or by the computer.">
                  <option value="0" selected="selected">Human</option>
                  <option value="1">AI (Test)</option>
                </select>
              </div>
              <div id="player3input" class="player-input">
                Player 3: <input type="text" id="player3name" title="Player name" maxlength="16" value="Player 3" />
                <select id="player3color" title="Player color">
                  <option style="color: aqua;">Aqua</option>
                  <option style="color: black;">Black</option>
                  <option style="color: blue;">Blue</option>
                  <option style="color: fuchsia;">Fuchsia</option>
                  <option style="color: gray;">Gray</option>
                  <option style="color: green;">Green</option>
                  <option style="color: lime;">Lime</option>
                  <option style="color: maroon;">Maroon</option>
                  <option style="color: navy;">Navy</option>
                  <option style="color: olive;">Olive</option>
                  <option style="color: orange;">Orange</option>
                  <option style="color: purple;">Purple</option>
                  <option selected="selected" style="color: red;">Red</option>
                  <option style="color: silver;">Silver</option>
                  <option style="color: teal;">Teal</option>
                  <option style="color: yellow;">Yellow</option>
                </select>
                <select id="player3ai" title="Choose whether this player is controled by a human or by the computer.">
                  <option value="0" selected="selected">Human</option>
                  <option value="1">AI (Test)</option>
                </select>
              </div>
              <div id="player4input" class="player-input">
                Player 4: <input type="text" id="player4name" title="Player name" maxlength="16" value="Player 4" />
                <select id="player4color" title="Player color">
                  <option style="color: aqua;">Aqua</option>
                  <option style="color: black;">Black</option>
                  <option style="color: blue;">Blue</option>
                  <option style="color: fuchsia;">Fuchsia</option>
                  <option style="color: gray;">Gray</option>
                  <option style="color: green;">Green</option>
                  <option selected="selected" style="color: lime;">Lime</option>
                  <option style="color: maroon;">Maroon</option>
                  <option style="color: navy;">Navy</option>
                  <option style="color: olive;">Olive</option>
                  <option style="color: orange;">Orange</option>
                  <option style="color: purple;">Purple</option>
                  <option style="color: red;">Red</option>
                  <option style="color: silver;">Silver</option>
                  <option style="color: teal;">Teal</option>
                  <option style="color: yellow;">Yellow</option>
                </select>
                <select id="player4ai" title="Choose whether this player is controled by a human or by the computer.">
                  <option value="0" selected="selected">Human</option>
                  <option value="1">AI (Test)</option>
                </select>
              </div>
              <div style="margin: 20px 0px;">
                <input type="button" value="Start Game" onclick="setup();" title="Begin playing." />
              </div>
            </div>

            <div id="control">
              <table>
                <tr>
                  <td style="text-align: left; vertical-align: top; border: none;">
                    <div id="menu">
                      <table id="menutable" cellSpacing="0">
                        <tr>
                          <td class="menu-item" id="buy-menu-item">
                            <a href="javascript:void(0);" title="View alerts and buy the property you landed on.">Buy</a>
                          </td>
                          <td class="menu-item" id="manage-menu-item">
                            <a href="javascript:void(0);" title="View, mortgage, and improve your property.">Manage</a>
                          </td>
                          <td class="menu-item" id="trade-menu-item">
                            <a href="javascript:void(0);" title="Exchange property with other players.">Trade</a>
                          </td>
                        </tr>
                      </table>
                    </div>
                    <div id="buy">
                      <div id="alert"></div>
                      <div id="landed"></div>
                    </div>
                    <div id="manage">
                      <div id="option">
                        <div id="buildings" title="Available buildings"></div>
                        <input type="button" value="Buy house" id="buyhousebutton"/>
                        <input type="button" value="Mortgage" id="mortgagebutton" />
                        <input type="button" value="Sell house" id="sellhousebutton"/>
                      </div>
                      <div id="owned"></div>
                    </div>
                  </td>
                  <td style="vertical-align: top; border: none;">
                    <div id="quickstats">
                      <div><span id="pname">Player 1</span>:</div>
                      <div><span id="pmoney">$1500</span></div>
                    </div>
                    <div>
                      <div id="die0" title="Die" class="die die-no-img"></div>
                      <div id="die1" title="Die" class="die die-no-img"></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="border: none">
                    <div style="padding-top: 8px;">
                      <input type="button" id="nextbutton" title="Roll the dice and move your token accordingly." value="Roll Dice"/>
                      <input type="button" id="resignbutton" title="If you cannot pay your debt then you must resign from the game." value="Resign" onclick="game.resign();" />
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <div id="trade">
              <table style={{borderSpacing: '3px'}}>
                <tr>
                  <td className="trade-cell">
                    <div id="trade-leftp-name"></div>
                  </td>
                  <td className="trade-cell">
                    <div id="trade-rightp-name"></div>
                  </td>
                </tr>
                <tr>
                  <td className="trade-cell">
                    $&nbsp;<input id="trade-leftp-money" value="0" title="Enter amount to exchange with the other player." />
                  </td>
                  <td className="trade-cell">
                    $&nbsp;<input id="trade-rightp-money" value="0" title="Enter amount to exchange with the other player." />
                  </td>
                </tr>
                <tr>
                  <td id="trade-leftp-property" className="trade-cell"></td>
                  <td id="trade-rightp-property" className="trade-cell"></td>
                </tr>
                <tr>
                  <td colspan="2" className="trade-cell">
                    <input type="button" id="proposetradebutton" value="Propose Trade" onclick="game.proposeTrade();" />
                    <input type="button" id="canceltradebutton" value="Cancel Trade" onclick="game.cancelTrade();" />
                    <input type="button" id="accepttradebutton" value="Accept Trade" onclick="game.acceptTrade();" />
                    <input type="button" id="rejecttradebutton" value="Reject Trade" onclick="game.cancelTrade();" />
                  </td>
                </tr>
              </table>
            </div>

            <div id="enlarge-wrap"></div>
          `;
        }

        // Wait a bit for scripts to initialize
        setTimeout(() => {
          if (window.setup && window.Player && !gameInitializedRef.current) {
            // Ensure player array is initialized
            if (!window.player || window.player.length === 0) {
              window.player = [];
              window.game = new window.Game();
              
              for (let i = 0; i <= 8; i++) {
                window.player[i] = new window.Player("", "");
                window.player[i].index = i;
              }
              
              window.player[1].human = true;
              window.player[0].name = "the bank";
              
              // Initialize AITest count
              if (window.AITest) {
                window.AITest.count = 0;
              }
            }
            
            // Override setup to use our bot selection
            const originalSetup = window.setup;
            window.setup = function() {
              // Ensure player array exists
              if (!window.player || window.player.length === 0) {
                window.player = [];
                for (let i = 0; i <= 8; i++) {
                  window.player[i] = new window.Player("", "");
                  window.player[i].index = i;
                }
                window.player[1].human = true;
                window.player[0].name = "the bank";
              }
              
              const pcount = numBots + 1;
              if (document.getElementById('playernumber')) {
                document.getElementById('playernumber').value = pcount;
              }
              
              // Set player 1 as human
              const player1nameEl = document.getElementById('player1name');
              const player1aiEl = document.getElementById('player1ai');
              if (player1nameEl) {
                player1nameEl.value = user?.name || user?.username || 'Player';
              }
              if (player1aiEl) {
                player1aiEl.value = '0';
              }
              
              // Set other players as AI
              for (let i = 2; i <= pcount; i++) {
                const playerAiEl = document.getElementById(`player${i}ai`);
                if (playerAiEl) {
                  playerAiEl.value = '1';
                }
              }
              
              // Hide setup UI
              setShowSetup(false);
              
              // Call original setup
              try {
                originalSetup();
                
                // Start tracking score after a delay to ensure game is initialized
                setTimeout(() => {
                  startScoreTracking();
                }, 1000);
              } catch (error) {
                console.error('Error in setup:', error);
                alert('Error starting game. Please try again.');
                setShowSetup(true);
              }
            };
            
            gameInitializedRef.current = true;
          }
        }, 1000);
      } catch (error) {
        console.error('Error loading Monopoly game:', error);
      }
    };

    initializeGame();

    return () => {
      // Cleanup if needed
    };
  }, [gameRunning, isPaused, numBots, user]);

  const startScoreTracking = () => {
    const interval = setInterval(() => {
      if (window.player && window.player[1]) {
        const playerMoney = window.player[1].money || 0;
        if (playerMoney !== currentScore) {
          setCurrentScore(playerMoney);
          onScoreChange(playerMoney);
        }
      }
    }, 1000);
    
    // Store interval for cleanup
    return () => {
      clearInterval(interval);
    };
  };

  const handleStartGame = () => {
    if (playMode === 'computer') {
      if (window.setup) {
        window.setup();
      } else {
        alert('Game is still loading. Please wait a moment and try again.');
      }
    } else if (playMode === 'online') {
      handleStartOnlineGame();
    }
  };

  const handleStartOnlineGame = () => {
    if (!socket) {
      alert('Socket connection not available. Please refresh the page.');
      return;
    }
    
    // Join online game
    socket.emit('join-monopoly', {
      studentId: user?.id || 'guest',
      studentName: user?.name || user?.username || 'Player',
      studentUSN: user?.usn || 'GUEST',
      numBots: 0 // No bots for online play
    });
    
    // For online play, we'll use the same game interface but with socket synchronization
    // Load the game scripts if not already loaded
    if (scriptsLoadedRef.current && window.setup) {
      // Initialize the game for online play
      // We'll need to set up players from socket state instead of setup form
      setShowSetup(false);
    } else {
      // Wait for scripts to load
      setTimeout(() => {
        if (window.setup) {
          setShowSetup(false);
        } else {
          alert('Game is still loading. Please wait a moment and try again.');
        }
      }, 2000);
    }
  };

  return (
    <div className="monopoly-game-wrapper">
      {showSetup && !playMode && (
        <div className="setup-overlay">
          <h2>Monopoly Setup</h2>
          <p>Choose how you want to play:</p>
          <div className="mode-selection">
            <button
              className={`mode-btn ${playMode === 'online' ? 'selected' : ''}`}
              onClick={() => setPlayMode('online')}
            >
              🌐 Play Online
            </button>
            <button
              className={`mode-btn ${playMode === 'computer' ? 'selected' : ''}`}
              onClick={() => setPlayMode('computer')}
            >
              💻 Play with Computer
            </button>
          </div>
        </div>
      )}
      
      {showSetup && playMode === 'computer' && (
        <div className="setup-overlay">
          <h2>Monopoly Setup</h2>
          <p>Select number of bots to play against:</p>
          <button
            className="back-btn"
            onClick={() => setPlayMode(null)}
          >
            ← Back
          </button>
          <div className="bot-selection">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                className={`bot-btn ${numBots === num ? 'selected' : ''}`}
                onClick={() => setNumBots(num)}
              >
                {num} Bot{num !== 1 ? 's' : ''} ({num + 1} Total)
              </button>
            ))}
          </div>
          <button onClick={handleStartGame} className="start-btn">Start Game</button>
        </div>
      )}
      
      {showSetup && playMode === 'online' && (
        <div className="setup-overlay">
          <h2>Monopoly Online</h2>
          <p>Play with other players online!</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            You'll be matched with other players. The game will start when enough players join.
          </p>
          <button
            className="back-btn"
            onClick={() => setPlayMode(null)}
          >
            ← Back
          </button>
          <button onClick={handleStartOnlineGame} className="start-btn" style={{ marginTop: '20px' }}>
            Join Online Game
          </button>
        </div>
      )}
      
      <div ref={gameContainerRef} className="monopoly-container-inner"></div>
    </div>
  );
};

export default MonopolyGame;
