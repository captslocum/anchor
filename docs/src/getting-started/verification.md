# Verifiable Builds

Building programs with the Solana CLI may embed machine specfic
code into the resulting binary. As a result, building the same program
on different machines may produce different executables. To get around this
problem, one can build inside a docker image with pinned dependencies to produce
a verifiable build.

Anchor makes this easy by providing CLI commands to build take care of
docker for you. To get started, first make sure you
[install](https://docs.docker.com/get-docker/) docker on your local machine.

## Building

To produce a verifiable build, run

```bash
anchor build --verifiable
```

## Verifying

To verify a build against a program deployed on mainnet, run

```bash
anchor verify -p <lib-name> <program-id>
```

where the `<lib-name>` is defined by your program's Cargo.toml.

If the program has an IDL, it will also check the IDL deployed on chain matches.

## Images

A docker image for each version of Anchor is published on [Docker Hub](https://hub.docker.com/r/projectserum/build). They are tagged in the form `projectserum/build:<version>`. For example, to get the image for Anchor `v0.16.2` one can run

```
docker pull projectserum/build:v0.16.2
```

## Removing an Image
 In the event you run a verifiable build from the CLI and exit prematurely,
 it's possible the docker image may still be building in the background.

To remove, run

```
docker rm -f anchor-program
```

where `anchor-program` is the name of the image created by default from within
the Anchor CLI.
