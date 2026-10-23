ssh server -T <<'EOL'
	cd bowling-game && \
	git fetch && git reset --hard origin/main && \
	docker compose up --build -d
EOL
