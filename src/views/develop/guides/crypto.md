# Cryptography

---

{{> stub }}

Every TV carries OpenSSL, and every TV carries a different one. That is a problem for a TLS
connection, and just as much for a hash or a cipher, because `libssl` and `libcrypto` move
together.

## The Trap

OpenSSL crosses four SONAMEs between webOS 1 and webOS 11. A binary linked against one
will not start on a TV carrying another.

| webOS | OpenSSL | SONAME |
| --- | --- | --- |
| 1.x to 4.10 | 1.0.1, then 1.0.2 from 3.5 | `libssl.so.1.0.0` |
| 5.x | 1.0.2 | `libssl.so.1.0.2` |
| 6.x | 1.0.2 and 1.1.1, both present | `libssl.so.1.0.2`, `libssl.so.1.1` |
| 7.x, 8.x | 1.1.1 | `libssl.so.1.1` |
| 9.x to 11.x | 3.0.9, 3.0.13, 3.2.3 | `libssl.so.3` |

`libcrypto` carries the same SONAME as `libssl` on every one of those releases, so this is
not only a TLS problem. An app that never opens a socket, and only wants SHA-256 or AES, is
tied to the same narrow band of TVs.

Note the webOS 5 boundary. The OpenSSL version does not change there, only the SONAME, so
the same code is unreachable across it.

The version spread bites as well as the SONAME. 1.0.1 predates TLS 1.2 being usable in
practice, and a server that has since dropped older ciphers will refuse the handshake, on
a TV that is otherwise working fine.

[Can I Use](/develop/caniuse) carries the same data, and warns against the library for
this reason.

## Ways Out

### Let libcurl Carry TLS

The simplest one. libcurl keeps a stable ABI across every release, so you never name a TLS
library yourself. See [Networking](/develop/guides/native/net).

It solves TLS and nothing else. If you want a hash or a cipher of your own as well, you
still need one of the two below.

### Bundle mbedTLS

mbedTLS is small, permissively licensed and built to be vendored, so you can carry one
known version to every TV and stop caring what the system has. It covers the primitives as
well as TLS, and curl can be built against it.

### Bundle OpenSSL

Heavier, and worth it only when you need something mbedTLS lacks.
