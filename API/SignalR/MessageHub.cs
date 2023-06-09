﻿using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    [Authorize]
    public class MessageHub : Hub
    {
        private readonly IMessageRepository messageRepository;
        private readonly IUserRepository userRepository;
        private readonly IMapper mapper;
        private readonly IHubContext<PresenceHub> presenceHub;

        public MessageHub(IMessageRepository messageRepository, IUserRepository userRepository, IMapper mapper, IHubContext<PresenceHub> presenceHub)
        {
            this.messageRepository = messageRepository;
            this.userRepository = userRepository;
            this.mapper = mapper;
            this.presenceHub = presenceHub;
        }

        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var mainUser = Context.User.GetUserName();
            var otherUser = httpContext.Request.Query["user"];
            var groupName = GetGroupName(mainUser, otherUser);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            var group = await AddToGroup(groupName);

            await Clients.Group(groupName).SendAsync("UpdatedGroup", group);

            var messages = await messageRepository.GetMessageThread(mainUser, otherUser);

            await Clients.Caller.SendAsync("ReceiveMessageThread", messages);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var group = await RemoveFromMessageGroup();
            await Clients.Group(group.Name).SendAsync("UpdatedGroup");
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(CreateMessageDto createMessageDto)
        {
            var username = Context.User.GetUserName();

            if (username == createMessageDto.RecipientUsername.ToLower())
                throw new HubException("You cannot send messages to yourself");

            var sender = await userRepository.GetUserByNameAsync(username);
            var recipient = await userRepository.GetUserByNameAsync(createMessageDto.RecipientUsername);

            if (recipient == null) throw new HubException("Not found user");

            var message = new Message
            {
                Sender = sender,
                Recipient = recipient,
                SenderUsername = sender.UserName,
                RecipientUsername = recipient.UserName,
                Content = createMessageDto.Content
            };

            var groupName = GetGroupName(sender.UserName, recipient.UserName);

            var group = await messageRepository.GetMessageGroup(groupName);

            if (group.Connections.Any(c => c.Username == recipient.UserName))
            {
                message.DateRead = DateTime.UtcNow;
            } else
            {
                var connections = await PresenceTracker.GetConnectionsForUser(recipient.UserName);
                if (connections != null)
                {
                    await presenceHub.Clients.Clients(connections).SendAsync("NewMessageReceived", new { username = sender.UserName, knownAs = sender.KnownAs });
                }
            }

            messageRepository.AddMessage(message);

            if (await messageRepository.SaveAllAsync())
            {
                await Clients.Group(groupName).SendAsync("NewMessage", mapper.Map<Message>(message));
            }
        }

        private string GetGroupName(string caller, string other)
        {
            var stringCompare = string.CompareOrdinal(caller, other) < 0;
            return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
        }

        private async Task<Group> AddToGroup(string groupName)
        {
            var group = await messageRepository.GetMessageGroup(groupName);
            var connection = new Connection(Context.ConnectionId, Context.User.GetUserName());

            if (group == null)
            {
                group = new Group(groupName);
                messageRepository.AddGroup(group);
            }

            group.Connections.Add(connection);

            if (await messageRepository.SaveAllAsync()) return group;

            throw new HubException("Failed to add to group");
        }

        private async Task<Group> RemoveFromMessageGroup()
        {
            var connectionId = Context.ConnectionId;
            var group = await messageRepository.GetGroupForConnection(connectionId);
            var connection = group.Connections.FirstOrDefault(c => c.ConnectionId == connectionId);
            messageRepository.RemoveConnection(connection);
            
            if (await messageRepository.SaveAllAsync()) return group;

            throw new HubException("Failed to remove from group");
        }
    }
}