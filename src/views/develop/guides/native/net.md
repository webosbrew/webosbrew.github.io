# Networking

---

{{> stub }}

A TV ships libcurl, OpenSSL and SDL2-net. Check [Can I Use](/develop/caniuse) for the
version on your target.

> [!WARNING]
> Do not link the system OpenSSL. It crosses four SONAMEs between webOS 1 and webOS 11,
> so a binary linked against one will not start on a TV carrying another.
> [TLS](/develop/guides/tls) covers the spread and the ways out.

## Choose a Library

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

### SDL2-net

## Make an HTTP Request

## Discover Devices on the Network

## Troubleshooting

### The Request Fails Only on Older Releases

### Certificate Verification Fails
