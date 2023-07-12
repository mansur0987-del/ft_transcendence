#!/bin/bash

export API_PORT=3001
export API_HOST=http://localhost:

export TYPEORM_CONNECTION=postgres
export TYPEORM_PORT=5432
export TYPEORM_USERNAME=ft_transcendence
export TYPEORM_PASSWORD=1234
export TYPEORM_DATABASE=ft_transcendence

export JWT_ACCESS_KEY=AccessSecret
export EXPIRESIN_ACCESS_KEY=2d

export UID_42=u-s4t2ud-7dc9defa856531594e86851a4f608353e257ebd040e6160f45c7da2cc4d0e2b1
export FR_42_SECRET=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

export REDIRECT_URI=http://localhost:3001/auth/callback

export HOST_FRONT=localhost

export BASE_URL=http://localhost:3001/
export FRONT_URL=http://localhost:8080

cd backend && npm run start:dev
