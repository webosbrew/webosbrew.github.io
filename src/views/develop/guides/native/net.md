# Networking

---

{{> stub }}

Plain BSD sockets work, and they are the right place to start. The TV also ships libcurl,
OpenSSL and SDL2_net. Check [Can I Use](/develop/caniuse) for the version on your target.

> [!WARNING]
> Do not link the system OpenSSL. It crosses four SONAMEs between webOS 1 and webOS 11,
> so a binary linked against one will not start on a TV carrying another.
> [TLS](/develop/guides/tls) covers the spread and the ways out.

## Choose a Library

### Sockets

The TV runs Linux, so the usual BSD socket calls are there and behave normally. For a
protocol you are implementing yourself, this is the answer. Reach for a library when it
buys you something, not by default.

### libcurl

Present since webOS 1, and the version moves without breaking the ABI. One wrinkle:
before webOS 5, webOS
[shipped libcurl as `libcurl.so.5`](https://www.openembedded.org/pipermail/openembedded-core/2017-February/132583.html)
instead of `libcurl.so.4`.

A shim carries you across that boundary. moonlight-tv ships one at
`third_party/commons/platform/webos/curl-abi-fix`. It holds no code, only a `DT_NEEDED`
entry:

1. Build an empty library named for the SONAME the TV has, and link it against the real
   libcurl.
2. Build a second empty library named for the SONAME your app links, and link that
   against the first.
3. Ship the second library with your app.

Your app asks for `libcurl.so.4`, finds the shim you shipped, and the shim pulls in the
system `libcurl.so.5`. Link curl the normal way and forget the boundary is there. The same
shape of trick works for any library that only changed its SONAME.

### OpenSSL

See [TLS](/develop/guides/tls).

### SDL2_net

`libSDL2_net-2.0.so.0` is on every release, but it is a thin wrapper over the same sockets.
Its selling point is portability, which buys you nothing on a target that is only ever a
TV. Use it if your code already leans on SDL elsewhere. Otherwise skip it.

## Discover Devices on the Network

mDNS is the usual answer, and the TV's own client is not it.

`libavahi-client` shows up from webOS 4 on, and is missing from every release before that.
Where it is present it does not work well enough to build on, so treat the TV as having no
mDNS client and link your own into the app.

moonlight-tv takes that route. It carries
[libmicrodns](https://github.com/videolabs/libmicrodns) in `third_party/`, with a
`libdns_sd` path beside it as a second option.
