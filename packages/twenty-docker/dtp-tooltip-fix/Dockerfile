ARG BASE_IMAGE
FROM ${BASE_IMAGE}

COPY --chown=1000:1000 overflow-tooltip.css /app/packages/twenty-server/dist/front/dtp-overflow-tooltip-20260924.css
COPY install-tooltip-patch.mjs /tmp/install-tooltip-patch.mjs
RUN node /tmp/install-tooltip-patch.mjs && rm /tmp/install-tooltip-patch.mjs
