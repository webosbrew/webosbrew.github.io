# Getting Video Output

---

LG uses different panel interfaces for different models:

1. LVDS for older 1080p models
2. Vx1 for some UHD models
3. EPI (propertiery p2p interface by LG), very common

We can easily get video output from 1 & 2. However, without expensive tool, it's very hard to get video output.

### Boards to Buy

| Series | webOS | Panel Interface | Resolution | Part No. (ATSC) | Part No. (DVB) | Notes                                      |
|--------|-------|-----------------|------------|-----------------|----------------|--------------------------------------------|
| EC93   | 1.x   | LVDS            | 1920x1080  | EAX66612205     | EAX65612205    |                                            |
| LF63   | 2.x   | LVDS            | 1920x1080  | EAX66202604     | EAX66202603    |                                            |
| UM76   | 4.x   | Vx1             | 3840x2160  | EAX68253604     | EAX68253604    | Vx1 interface only available for 75" model |

### Parts

#### LVDS Ribbon Cable

For many LVDS models, 51-pin FFC connectors are used. However, since the wiring is flipped, to get a working cable,
following part numbers are recommended:

| Part No.    | Notes                                          |
|-------------|------------------------------------------------|
| EAD63990501 | Common on recent models                        |
| EAD63265812 | Hard to find, seems to be used on older models |