
# Step 1: Build the application
FROM oven/bun:1.0.13-slim as base

# Set the working directory in the container
WORKDIR /app

# Copy all the application files to the container
COPY . .

# Run your build process
RUN bun i
RUN bun run build

# Step 2: Create a smaller image for running the application
FROM base as release

# Copy only the necessary files from the builder image to the final image
COPY --from=base /app/build .

# Expose the port the application will run on
EXPOSE 3000

#Start the BUN server
CMD bun run .
