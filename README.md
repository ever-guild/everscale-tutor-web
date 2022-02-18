# 🚀 Everscale awesome DApp

## Develop environment require

- `POSIX` (bash, grep, cut, sort, etc)
- `nvm` https://github.com/nvm-sh/nvm
- `yarn` https://yarnpkg.com/getting-started/install
- `docker` https://docs.docker.com/engine/install 

### Dependencies

```shell
nvm use $(yarn --ignore-engines --silent nvm)
yarn install
```

### Network `localnet`

```shell
npx everdev se reset
npx everdev network add localnet http://localhost
npx everdev signer add giver 172af540e43a524763dd53b26a066d472a97c4de37d5498170564510608250c3
npx everdev network giver localnet 0:b5e9240fc2d2f1ff8cbb1d1dee7fb7cae155e5f6320e585fcc685698994a19a5 --signer giver
npx everdev network default localnet
```

### Network `testnet`

```shell
npx everdev network add testnet net.ton.dev
npx everdev signer add giver 172af540e43a524763dd53b26a066d472a97c4de37d5498170564510608250c3
npx everdev network giver testnet 0:b5e9240fc2d2f1ff8cbb1d1dee7fb7cae155e5f6320e585fcc685698994a19a5 --signer giver
npx everdev network default testnet
```

## Deploy

```shell
yarn contract-deploy
```

## Develop

```shell
yarn start
```

## Publish

```shell
yarn gh-pages
```
