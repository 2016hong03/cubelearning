// 큐브 학습 콘텐츠와 twisty-player 설정을 이 파일에서 관리하세요.

export const sevenStepCases = [
  {
    title: 'Case 1',
    description: '엣지 조각이 상하좌우로 서로 바뀌어야 하는 경우',
    setup: 'x2 M2 U M2 U2 M2 U M2'
  },
  {
    title: 'Case 2',
    description: '엣지 조각이 대각선으로 서로 바뀌어야 하는 경우',
    setup: "x2 U M2 U M' U2 M2 U2 M' U' M2 U'"
  },
  {
    title: 'Case 3',
    description: '엣지 조각이 시계 방향으로 바뀌어야 하는 경우',
    setup: "x2 R2 U' R' U' R U R U R U' R"
  },
  {
    title: 'Case 4',
    description: '엣지 조각이 반시계 방향으로 바뀌어야 하는 경우',
    setup: "x2 R' U R' U' R' U' R' U R U R2"
  }
];

export const beginnerLessons = [
  ['1층 십자가 맞추기', '1층 십자가를 맞추는 단계', 'https://cubelearning.tistory.com/2'],
  ['1층 코너 맞추기', '1층 코너를 맞추는 단계', 'https://cubelearning.tistory.com/3'],
  ['2층 엣지 맞추기', '2층 엣지를 맞추는 단계', 'https://cubelearning.tistory.com/4'],
  ['3층 십자가 맞추기', '3층 십자가를 맞추는 단계', 'https://cubelearning.tistory.com/5'],
  ['3층 윗면 맞추기', '3층 윗면을 맞추는 단계', 'https://cubelearning.tistory.com/6'],
  ['3층 코너 맞추기', '3층 코너를 맞추는 단계', 'https://cubelearning.tistory.com/7'],
  ['3층 엣지 맞추기', '3층 엣지를 맞추는 단계', 'https://cubelearning.tistory.com/8']
].map(([title, summary, source], index) => ({
  id: index + 1,
  title,
  summary,
  source,
  body: '',
  algorithm: '',
  image: '',
  tips: '',
  practice: '',
  cases: []
}));

beginnerLessons[6].body = '큐브가 전부 완성된 경우를 제외하면 총 4가지 케이스가 있습니다.';
beginnerLessons[6].algorithm = "R U R' U' L' U' L U U R U' R' U' L' U L";
beginnerLessons[6].cases = sevenStepCases;
