export type Visibility = 'PRIVATE' | 'PROTECTED' | 'PUBLIC';
export type State = 'NORMAL' | 'ARCHIVED';

export interface Memo {
  name: string;
  state: State;
  creator: string;
  createTime: string;
  updateTime: string;
  displayTime: string;
  content: string;
  visibility: Visibility;
  tags: string[];
  pinned: boolean;
  snippet: string;
  property: {
    hasLink: boolean;
    hasTaskList: boolean;
    hasCode: boolean;
    hasIncompleteTasks: boolean;
  };
}

export interface MemoList {
  memos: Memo[];
  nextPageToken: string;
}
