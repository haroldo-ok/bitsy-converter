/*settings*{"name":"Your game's title here","author":"Bitsy-Converter","image":[240,240,240,240,240,240,240,240,240,240,240,240,0,0,0,0,0,0,0,0,0,0,0,15,240,0,0,0,0,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,8,0,0,15,240,0,0,0,0,0,0,0,8,0,0,0,0,0,153,153,153,153,153,153,152,0,0,159,240,9,25,25,17,17,17,17,24,168,168,144,0,241,145,145,17,28,204,193,24,136,136,159,240,15,17,17,255,17,17,17,24,168,168,144,0,0,255,255,255,255,255,255,250,0,0,159,240,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,10,0,0,15,240,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,240,0,0,0,0,0,0,0,0,0,0,0,15,15,15,15,15,15,15,15,15,15,15,15]}*/

#define ofs_BLANK 0,
#define ofs_TIL_a 1
#define ofs_TIL_b 2
#define ofs_TIL_c 4
#define ofs_TIL_d 5
#define ofs_SPR_A 6
#define ofs_SPR_a 8
#define ofs_SPR_b 10
#define ofs_ITM_0 11

#define false 0
#define true 1

#define DIALOG_ID_SPR_a 1
#define DIALOG_ID_SPR_b 2

#define ENDING_ID_0 1

#define SPRITE_REC_SIZE 4
#define SPRITE_OFS_TILE 0
#define SPRITE_OFS_X 1
#define SPRITE_OFS_Y 2
#define SPRITE_OFS_DLG 3

#define ROOM_REC_SIZE 7
#define ROOM_OFS_MAP 0
#define ROOM_OFS_SPR_COUNT 1
#define ROOM_OFS_SPR_DATA 2
#define ROOM_OFS_EXIT_COUNT 3
#define ROOM_OFS_EXIT_DATA 4
#define ROOM_OFS_END_COUNT 5
#define ROOM_OFS_END_DATA 6

#define TILE_INFO_REC_SIZE 2
#define TILE_INFO_OFS_IS_WALL 0
#define TILE_INFO_OFS_FRAME_COUNT 1

#define TILE_EXIT_REC_SIZE 5
#define TILE_EXIT_OFS_ORIG_X 0
#define TILE_EXIT_OFS_ORIG_Y 1
#define TILE_EXIT_OFS_DEST_X 2
#define TILE_EXIT_OFS_DEST_Y 3
#define TILE_EXIT_OFS_DEST_ROOM 4

#define ENDING_REC_SIZE 3
#define ENDING_OFS_X 0
#define ENDING_OFS_Y 1
#define ENDING_OFS_DLG 2

char gameTitle[] = "Your game's title here";

int playerSpriteStart[] = { ofs_SPR_A, 4, 4 };

int room_0_sprites[] = {
  ofs_SPR_a, 8, 12, DIALOG_ID_SPR_a,
  ofs_SPR_b, 10, 6, DIALOG_ID_SPR_b
};

char room_0_exits[] = {
  7, 0, 7, 15, 1
};

char room_1_exits[] = {
  7, 15, 7, 0, 0,
  0, 11, 14, 11, 2
};

char room_2_endings[] = {
  13, 11, ENDING_ID_0
};

char room_0[] = {
  0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0,
  0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0,
  0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0,
  0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
  0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
  0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
  0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
  0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
  0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
  0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
  0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
  0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0,
  0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0,
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
};

char room_1[] = {
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 0, 0, 0,
  0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 0, 2, 0, 0,
  0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0,
  0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
  4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0
};

char room_2[] = {
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0, 1,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
};

int rooms[] = {
  room_0, 2, room_0_sprites, 1, room_0_exits, 0, 0,
  room_1, 0, 0, 2, room_1_exits, 0, 0,
  room_2, 0, 0, 0, 0, 1, room_2_endings
};

char tileInfos[] = {
  // BLANK
  false, 1,
  // TIL_a
  true, 1,
  // TIL_b
  false, 2,
  false, 2,
  // TIL_c
  false, 1,
  // TIL_d
  false, 1,
  // SPR_A
  false, 2,
  false, 2,
  // SPR_a
  false, 2,
  false, 2,
  // SPR_b
  false, 1,
  // ITM_0
  false, 1
};

char image_BLANK_0[] = { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };
char image_TIL_a_0[] = { 0x11, 0x11, 0x11, 0x11, 0x10, 0x00, 0x00, 0x01, 0x10, 0x00, 0x00, 0x01, 0x10, 0x01, 0x10, 0x01, 0x10, 0x01, 0x10, 0x01, 0x10, 0x00, 0x00, 0x01, 0x10, 0x00, 0x00, 0x01, 0x11, 0x11, 0x11, 0x11 };
char image_TIL_b_0[] = { 0x00, 0x00, 0x00, 0x00, 0x00, 0x11, 0x01, 0x10, 0x00, 0x00, 0x00, 0x00, 0x01, 0x10, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x11, 0x01, 0x10, 0x00, 0x00, 0x00, 0x00, 0x01, 0x10, 0x11, 0x00 };
char image_TIL_b_1[] = { 0x00, 0x00, 0x00, 0x00, 0x01, 0x10, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x11, 0x01, 0x10, 0x00, 0x00, 0x00, 0x00, 0x01, 0x10, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x11, 0x01, 0x10 };
char image_TIL_c_0[] = { 0x00, 0x11, 0x11, 0x10, 0x01, 0x00, 0x00, 0x10, 0x10, 0x00, 0x00, 0x01, 0x10, 0x00, 0x00, 0x10, 0x10, 0x00, 0x00, 0x01, 0x10, 0x00, 0x00, 0x10, 0x01, 0x00, 0x00, 0x01, 0x00, 0x11, 0x11, 0x10 };
char image_TIL_d_0[] = { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x11, 0x00, 0x00, 0x01, 0x10, 0x00, 0x00, 0x01, 0x11, 0x01, 0x00, 0x01, 0x10, 0x01, 0x10, 0x11, 0x11, 0x01, 0x10, 0x11, 0x00, 0x00, 0x00, 0x00 };
char image_SPR_A_0[] = { 0x00, 0x02, 0x20, 0x00, 0x00, 0x02, 0x20, 0x00, 0x00, 0x02, 0x20, 0x00, 0x00, 0x22, 0x22, 0x00, 0x02, 0x22, 0x22, 0x20, 0x20, 0x22, 0x22, 0x02, 0x00, 0x20, 0x02, 0x00, 0x00, 0x20, 0x00, 0x00 };
char image_SPR_A_1[] = { 0x00, 0x02, 0x20, 0x00, 0x00, 0x02, 0x20, 0x00, 0x20, 0x02, 0x20, 0x02, 0x02, 0x22, 0x22, 0x20, 0x00, 0x22, 0x22, 0x00, 0x00, 0x22, 0x22, 0x00, 0x00, 0x20, 0x02, 0x00, 0x00, 0x00, 0x02, 0x00 };
char image_SPR_a2_0[] = { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x02, 0x00, 0x02, 0x02, 0x22, 0x00, 0x02, 0x02, 0x22, 0x00, 0x20, 0x02, 0x22, 0x22, 0x00, 0x00, 0x22, 0x22, 0x00, 0x00, 0x20, 0x02, 0x00 };
char image_SPR_a2_1[] = { 0x00, 0x00, 0x00, 0x00, 0x02, 0x02, 0x00, 0x00, 0x02, 0x22, 0x00, 0x02, 0x02, 0x22, 0x00, 0x02, 0x02, 0x22, 0x00, 0x20, 0x00, 0x22, 0x22, 0x00, 0x00, 0x22, 0x22, 0x00, 0x02, 0x00, 0x00, 0x20 };
char image_SPR_b_0[] = { 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, 0x22, 0x22, 0x22, 0x22, 0x20, 0x00, 0x00, 0x02, 0x20, 0x00, 0x00, 0x02, 0x20, 0x00, 0x00, 0x02 };
char image_ITM_0_0[] = { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x11, 0x11, 0x00, 0x01, 0x10, 0x01, 0x00, 0x00, 0x10, 0x01, 0x00, 0x00, 0x01, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00 };
    
int images[] = { 
  image_BLANK_0,
  image_TIL_a_0,
  image_TIL_b_0,
  image_TIL_b_1,
  image_TIL_c_0,
  image_TIL_d_0,
  image_SPR_A_0,
  image_SPR_A_1,
  image_SPR_a2_0,
  image_SPR_a2_1,
  image_SPR_b_0,
  image_ITM_0_0
}

int backgroundMap[441];

char startingGame = false;
int currentLevel = 0;
char needUpdate = true;
int playerSprite[SPRITE_REC_SIZE];
int frameControl = 0;
int frameDelay = 0;
 
int currentDialog = 0;
int currentEnding = 0;

void delay(int t){
  settimer(0, t);
  while(gettimer(0) != 0){};
}

void init(){
  setbgcolor(0);
  setcolor(9);
  clearscreen();
  setimagesize(1);

  loadtile(backgroundMap, 8, 8, 16, 16);

}

int calcRoomPointer() {
  return currentLevel * ROOM_REC_SIZE;
}

int imageNumberForTile(char tn) {
  int tn, p;
  char frameCount;

  p = tn * TILE_INFO_REC_SIZE;
  frameCount = tileInfos[p + TILE_INFO_OFS_FRAME_COUNT];

  return images[tn + frameControl % frameCount];
}

void drawSprite(char targetNum, char srcIndex, int sprite[]) {
  int p = srcIndex * SPRITE_REC_SIZE;
  getsprite(targetNum, imageNumberForTile(sprite[p + SPRITE_OFS_TILE]));
  spritesetvalue(targetNum, S_WIDTH, 8);
  spritesetvalue(targetNum, S_HEIGHT,8);
  putsprite(targetNum, sprite[p + SPRITE_OFS_X] * 8, sprite[p + SPRITE_OFS_Y] * 8);
}

char checkRoomTilesCollision(int playerX, int playerY, char map[]) {
  int p;

  char tn = map[playerY * 16 + playerX];
  if (!tn) {
    return false;
  }

  p = tn * TILE_INFO_REC_SIZE;
  return tileInfos[p + TILE_INFO_OFS_IS_WALL];
}

char checkSpritesCollision(int playerX, int playerY, int roomSprites[], int spriteCount) { 
  int p = 0;
  char i;

  for (i = 0; i < spriteCount; i++) {
    if (playerX == roomSprites[p + SPRITE_OFS_X] && playerY == roomSprites[p + SPRITE_OFS_Y]) {      
      currentDialog = roomSprites[p + SPRITE_OFS_DLG];
      return true;
    }
    p += SPRITE_REC_SIZE;
  }

  return false;
}
	
char checkExitsCollision(int playerX, int playerY, char roomExits[], int exitCount) { 
  int p = 0;
  char i;

  for (i = 0; i < exitCount; i++) {
    if (playerX == roomExits[p + TILE_EXIT_OFS_ORIG_X] && playerY == roomExits[p + TILE_EXIT_OFS_ORIG_Y]) {      
      playerSprite[SPRITE_OFS_X] = roomExits[p + TILE_EXIT_OFS_DEST_X];
      playerSprite[SPRITE_OFS_Y] = roomExits[p + TILE_EXIT_OFS_DEST_Y];
      currentLevel = roomExits[p + TILE_EXIT_OFS_DEST_ROOM];
      needUpdate = true;

      return true;
    }
    p += TILE_EXIT_REC_SIZE;
  }

  return false;
}
	
char checkEndingsCollision(int playerX, int playerY, char roomEndings[], int endingCount) { 
  int p = 0;
  char i;

  for (i = 0; i < endingCount; i++) {
   if (playerX == roomEndings[p + ENDING_OFS_X] && playerY == roomEndings[p + ENDING_OFS_Y]) {      
      currentEnding = roomEndings[p + ENDING_OFS_DLG];
      return true;
    }
    p += ENDING_REC_SIZE;
  }

  return false;
}

char tryMovingPlayer(int dx, int dy) {
  // Calculate where the player will try to move to
  int x = playerSprite[SPRITE_OFS_X];
  int y = playerSprite[SPRITE_OFS_Y];

  int roomP = calcRoomPointer();

  x += dx;
  y += dy;

  // Out of bounds  
  if (x < 0 || x > 15 || y < 0 || y > 15) {
    return false;
  }

  // Check if there are background tiles in the way
  if (checkRoomTilesCollision(x, y, rooms[roomP + ROOM_OFS_MAP])) {
    return false;
  }

  // Check collision against the sprites
  if (checkSpritesCollision(x, y, rooms[roomP + ROOM_OFS_SPR_DATA], rooms[roomP + ROOM_OFS_SPR_COUNT])) {
    return true;
  }
  
  // Check collision against the exits
  if (checkExitsCollision(x, y, rooms[roomP + ROOM_OFS_EXIT_DATA], rooms[roomP + ROOM_OFS_EXIT_COUNT])) {
    return true;
  }

  // Check collision against the endings
  if (checkEndingsCollision(x, y, rooms[roomP + ROOM_OFS_END_DATA], rooms[roomP + ROOM_OFS_END_COUNT])) {
    return true;
  }

  // No obstacles found: the player can move.
  playerSprite[SPRITE_OFS_X] = x;
  playerSprite[SPRITE_OFS_Y] = y;

  needUpdate = true;
  return true;
}

char controlPlayer() {
  char key = getkey();
	
  if (key & KEY_UP) {
    return tryMovingPlayer(0, -1);
  }
  if (key & KEY_DOWN) {
    return tryMovingPlayer(0, 1);
  }
  if (key & KEY_LEFT) {
    return tryMovingPlayer(-1, 0);
  }
  if (key & KEY_RIGHT) {
    return tryMovingPlayer(1, 0);
  }
  
  return false;
}

char drawRoom(char map[]) {
  for (int i = 0; i != 256; i++) {
    backgroundMap[i] = imageNumberForTile(map[i]);
  }
}

void hideSpritesAfter(int startIndex) {
  for (int i = startIndex + 1; i < 32; i++) {
    putsprite(i, 192, 192);
  }
}

void drawSprites(int roomSprites[], int spriteCount) { 
  int i;
	
  drawSprite(1, 0, playerSprite);
  
  for (i = 0; i < spriteCount; i++) {
    drawSprite(i + 2, i, roomSprites);
  }

  hideSpritesAfter(spriteCount + 1);
}

/* For some reason, using "char s[]" as a parameter makes "puts(s)" print gibberish. */
void showDialog(int s) {
  hideSpritesAfter(0);
	
  char blink = false;
  char blinkDelay = 0;

  setColor(11):
  fillRect(4,4,124, 68);

  setBgColor(11);
  setColor(7):
  gotoXY(1, 1);
  puts(s);

  // Blink cursor until player presses a button
  while (!(getkey() & (KEY_A|KEY_B))) {
    gotoXY(19, 7);
    setColor(blink ? 7 : 11):
    puts("_");
    delay(1);

    if (blinkDelay) {
      blinkDelay--;
    } else {
      blink = !blink;
      blinkDelay = 15;
    }
  }

  while (getkey()) {}
}

// This section will have to be generated, too

void dialog_SPR_a() {
  showDialog("Testing, 1, 2, 3!");
}

void dialog_SPR_b() {
  showDialog("I'm a chair!");
}

// Getting around the lack of function pointers
void showChosenDialog(int dlgNumber) {
  switch (dlgNumber) {
  case DIALOG_ID_SPR_a:
    dialog_SPR_a();
    break;
  case DIALOG_ID_SPR_b:
    dialog_SPR_b();
    break;
  }  
}

void dialog_ENDING_0() {
  showDialog("This is the end!");
}

// Getting around the lack of function pointers
void showChosenEnding(int endingNumber) {
  switch (endingNumber) {
  case ENDING_ID_0:
    dialog_ENDING_0();
    break;
  }  
}

void startGame() { 
  int i;
	
  clearscreen();
  showDialog(gameTitle);

  for (i = 0; i != SPRITE_REC_SIZE; i++) {
    playerSprite[i] = playerSpriteStart[i];
  }

  frameControl = 0;
  frameDelay = 0;
   
  currentLevel = 0;
  
  currentDialog = 0;
  currentEnding = 0;

  startingGame = false;
  needUpdate = true;
}

void endGame() {
  clearscreen();
  showChosenEnding(currentEnding);
  currentEnding = 0;
    
  startingGame = true;
  needUpdate = true;
}

void main(){
  int roomP;
	
  init();

  startingGame = true;

  for(;;) {
    // Display title screen if necessary
    if (startingGame) {
      startGame();
    }

    // Increment frame control for animations  
    if (frameDelay) {
      frameDelay--;
    } else {
      frameControl = (frameControl + 1) % 0x7FFF;
      frameDelay = 8;
      needUpdate = true;
    }

    controlPlayer();

    if (needUpdate) {
      roomP = calcRoomPointer(); 

      setBgColor(0);
      clearscreen();

      drawRoom(rooms[roomP + ROOM_OFS_MAP]);
      drawtile(0, 0);

      drawSprites(rooms[roomP + ROOM_OFS_SPR_DATA], rooms[roomP + ROOM_OFS_SPR_COUNT]);

      needUpdate = false;
    }

    if (currentDialog) {
      showChosenDialog(currentDialog);
      currentDialog = 0;
      needUpdate = true;
    }

    if (currentEnding) {
      showChosenEnding(currentEnding);
      currentEnding = 0;
      startingGame = true;
      needUpdate = true;
    }

    delayredraw();    
  }

}
