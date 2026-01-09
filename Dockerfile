# Multi-stage build for Igris JSON Tools

# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

var requiresCryptogram = map[Criteria]bool{
	{TokenType: rep.SUBSCRIPTION, TransactionType: constants.ValidateCard, IsRecurrent: false, SubscriptionType: ""}:                   true,
	{TokenType: rep.SUBSCRIPTION, TransactionType: constants.CofInitial, IsRecurrent: false, SubscriptionType: ""}:                     true,
	{TokenType: rep.SUBSCRIPTION, TransactionType: constants.CofSubsequent, IsRecurrent: false, SubscriptionType: constants.Scheduled}: false,
	{TokenType: rep.SUBSCRIPTION, TransactionType: constants.CofSubsequent, IsRecurrent: false, SubscriptionType: constants.OnDemand}:  true,
	{TokenType: rep.SUBSCRIPTION, TransactionType: constants.Charge, IsRecurrent: true, SubscriptionType: ""}:                          true,
	{TokenType: rep.TRANSACTION, TransactionType: constants.Charge, IsRecurrent: false, SubscriptionType: ""}:                          true,
	{TokenType: rep.TRANSACTION, TransactionType: constants.Charge, IsRecurrent: true, SubscriptionType: ""}:                           false,
	{TokenType: rep.TRANSACTION, TransactionType: constants.PreAuth, IsRecurrent: false, SubscriptionType: ""}:                         true,
	{TokenType: rep.TRANSACTION, TransactionType: constants.ReAuth, IsRecurrent: false, SubscriptionType: ""}:                          false,
	{TokenType: rep.TRANSACTION, TransactionType: constants.Refund, IsRecurrent: false, SubscriptionType: ""}:                          false,
	{TokenType: "", TransactionType: constants.Void, IsRecurrent: false, SubscriptionType: ""}:                                         false,
	{TokenType: "", TransactionType: constants.Reverse, IsRecurrent: false, SubscriptionType: ""}:            
    
    false,
}