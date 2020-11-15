import { Flex, IconButton, Text } from '@chakra-ui/core';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import React from 'react'
import { GetAllPostsQuery, useVoteMutation, VoteMutation } from '../generated/graphql';

interface VoteProps {
  post: GetAllPostsQuery['getAllPosts']['posts'][0]
}

export const Vote: React.FC<VoteProps> = ({ post }) => {
  const [, vote] = useVoteMutation();

  // const handleVote = async (value: number, postId: number, sign: number): Promise<VoteMutation | undefined> => {
  //   if (post.voteStatus == sign) {
  //     return;
  //   }
  //   await vote({ value, postId });
  // }

  return (
    <Flex mr={4} direction="column" alignItems="center" justifyContent="center">
      <IconButton 
        aria-label="upvote" 
        icon={<ChevronUpIcon w={6} h={6} />}
        onClick={async () => {
          if (post.voteStatus == 1) {
            return;
          }
          await vote({ postId: post.id, value: 1 });
        }}
        colorScheme={ post.voteStatus == 1 ? "green" : undefined}
      />
      <Text my={2}>{ post.points }</Text>
      <IconButton 
        aria-label="downvote"
        icon={<ChevronDownIcon w={6} h={6} />}
        onClick={async () => {
          if (post.voteStatus == -1) {
            return;
          }
          await vote({ postId: post.id, value: -1 });
        }}
        colorScheme={ post.voteStatus == -1 ? "red" : undefined}
      />
    </Flex>
  );
}
