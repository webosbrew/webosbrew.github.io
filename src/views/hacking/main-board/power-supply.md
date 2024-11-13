# Power Supply

---

Most TV models use 13.2V DC to power up the main board. Having a 12V DC power supply with at least 1.5A current rating
as the board draws around 1.2A current when powered up.

## LCD Models (12-pin Connector)

For many boards, a 12-pin connector is used to power up the board.

On some older boards:

| Left   |      |      |      |     | Right |
|--------|------|------|------|-----|-------|
| 1      | 3    | 5    | 7    | 9   | 11    |
| PWR ON | GND  | D13V | A13V | GND | -     |
| -      | D13V | D13V | A13V | GND | -     |
| 2      | 4    | 6    | 8    | 10  | 12    |

On some newer boards:

| Left |     |      |      |      | Right  |
|------|-----|------|------|------|--------|
| 1    | 3   | 5    | 7    | 9    | 11     |
| -    | GND | A13V | D13V | GND  | PWR ON |
| -    | GND | A13V | D13V | D13V | -      |
| 2    | 4   | 6    | 8    | 10   | 12     |

## OLED Models (24-pin Connector)

| Left |   |   |   |    |    |    |    |    |    |    | Right |
|------|---|---|---|----|----|----|----|----|----|----|-------|
| 1    | 3 | 5 | 7 | 9  | 11 | 13 | 15 | 17 | 19 | 21 | 23    |
| -    | - | - | - | -  | -  | -  | -  | -  | -  | -  | -     |
| -    | - | - | - | -  | -  | -  | -  | -  | -  | -  | -     |
| 2    | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20 | 22 | 24    |