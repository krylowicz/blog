import gql from 'graphql-tag';
import { Flex, IconButton, Text } from '@chakra-ui/core';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import React from 'react'
import { PostSnippetFragment, useVoteMutation, VoteMutation } from '../generated/graphql';
import { ApolloCache } from '@apollo/client';

interface VoteProps {
  post: PostSnippetFragment;
}

const updateAfterVote = (
  value: number,
  postId: number,
  cache: ApolloCache<VoteMutation>
) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
    voteStatus: number | null;
  }>({
    id: "Post:" + postId,
    fragment: gql`
      fragment _ on Post {
        id
        points
        voteStatus
      }
    `,
  });

  if (data) {
    if (data.voteStatus === value) {
      return;
    }
    const newPoints = (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
    cache.writeFragment({
      id: "Post:" + postId,
      fragment: gql`
        fragment __ on Post {
          points
          voteStatus
        }
      `,
      data: { points: newPoints, voteStatus: value },
    });
  }
};

export const Vote: React.FC<VoteProps> = ({ post }) => {
  const [vote] = useVoteMutation();

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
          if (post.voteStatus === 1) {
            return;
          }
          await vote({
            variables: {
              postId: post.id,
              value: 1,
            },
            update: (cache) => updateAfterVote(1, post.id, cache),
          });
        }}
        colorScheme={ post.voteStatus == 1 ? "green" : undefined}
      />
      <Text my={2}>{ post.points }</Text>
      <IconButton 
        aria-label="downvote"
        icon={<ChevronDownIcon w={6} h={6} />}
        onClick={async () => {
          if (post.voteStatus === -1) {
            return;
          }
          await vote({
            variables: {
              postId: post.id,
              value: -1,
            },
            update: (cache) => updateAfterVote(-1, post.id, cache),
          });
        }}
        colorScheme={ post.voteStatus == -1 ? "red" : undefined}
      />
    </Flex>
  );
}
