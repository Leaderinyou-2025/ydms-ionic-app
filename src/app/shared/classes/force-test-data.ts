import { IAuthData } from '../interfaces/auth/auth-data';
import { ILiyYdmsNotification } from '../interfaces/models/liy.ydms.notification';
import { ILiyYdmsClass } from '../interfaces/models/liy.ydms.class';
import { ILiyYdmsStudent } from '../interfaces/models/liy.ydms.student';

import { IFamilyDialogueSessionDetail, IFamilyDialogueSessionHistory, IFamilyDialogueSessionQuestion } from '../interfaces/family-dialogue-session/family-dialogue-session.interfaces';
import { EmotionType } from '../enums/personal-diary/personal-diary.enum';
import { IEmotionSuggestion, IPersonalDiaryEntry, } from '../interfaces/personal-diary/personal-diary.interfaces';
import { NotificationTypes } from '../enums/notification-type';
import { IResource } from '../interfaces/resource/resource.interface';
import { ResourceType } from '../enums/libary/resource-type.enum';
import { ResourceTopic } from '../enums/libary/resource-topic.enum';

export class ForceTestData {

  // Mock data for family dialogue sessions
  static familyDialogueSessions: IFamilyDialogueSessionHistory[] = [
    {
      id: 1,
      date: new Date(2023, 10, 15),
      title: 'Buổi đối thoại gia đình tháng 11',
      description: 'Chia sẻ về trải nghiệm học tập và mối quan hệ với bạn bè',
      status: 'completed'
    },
    {
      id: 2,
      date: new Date(2023, 9, 10),
      title: 'Buổi đối thoại gia đình tháng 10',
      description: 'Trao đổi về kế hoạch học tập và mục tiêu cá nhân',
      status: 'completed'
    },
    {
      id: 3,
      date: new Date(2023, 8, 5),
      title: 'Buổi đối thoại gia đình tháng 9',
      description: 'Chia sẻ về sở thích và hoạt động ngoại khóa',
      status: 'completed'
    },
    {
      id: 4,
      date: new Date(),
      title: 'Buổi đối thoại gia đình tháng 12',
      description: 'Trao đổi về kế hoạch cho kỳ nghỉ đông sắp tới',
      status: 'pending'
    }
  ];

  // Mock data for family dialogue session questions
  static familyDialogueSessionQuestions: IFamilyDialogueSessionQuestion[] = [
    {
      id: 1,
      text: 'Con đã học được điều gì mới trong tháng qua?',
      type: 'suggested',
      answer: 'Con đã học được cách giải các bài toán phức tạp hơn và cải thiện kỹ năng viết văn. Con cũng tham gia vào câu lạc bộ khoa học và làm một dự án nhỏ về năng lượng tái tạo.'
    },
    {
      id: 2,
      text: 'Con có gặp khó khăn gì trong việc học không?',
      type: 'suggested',
      answer: 'Con gặp một chút khó khăn với môn Tiếng Anh, đặc biệt là phần ngữ pháp. Con đang cố gắng dành thêm thời gian để luyện tập.'
    },
    {
      id: 3,
      text: 'Con có kế hoạch gì cho kỳ nghỉ sắp tới?',
      type: 'parent',
      answer: 'Con muốn đọc thêm sách và cải thiện kỹ năng vẽ. Con cũng muốn dành thời gian giúp bố mẹ việc nhà nhiều hơn.'
    },
    {
      id: 4,
      text: 'Con có hài lòng với kết quả học tập hiện tại không?',
      type: 'suggested',
      answer: 'Con khá hài lòng nhưng vẫn muốn cải thiện thêm môn Toán và Tiếng Anh.'
    },
    {
      id: 5,
      text: 'Con có gặp khó khăn gì trong việc giao tiếp với bạn bè không?',
      type: 'suggested',
      answer: 'Con không gặp nhiều khó khăn, nhưng đôi khi con cảm thấy ngại khi phải nói trước đám đông.'
    },
    {
      id: 6,
      text: 'Con có dự định gì cho kỳ nghỉ đông sắp tới?',
      type: 'suggested'
    },
    {
      id: 7,
      text: 'Con muốn cải thiện điều gì trong học kỳ tới?',
      type: 'suggested'
    },
    {
      id: 8,
      text: 'Con có muốn tham gia hoạt động nào cùng gia đình trong kỳ nghỉ không?',
      type: 'parent'
    }
  ];

  /**
   * Get family dialogue session detail by ID
   * @param id Session ID
   */
  static getFamilyDialogueSessionDetail(id: number): IFamilyDialogueSessionDetail | null {
    const session = this.familyDialogueSessions.find(s => s.id === id);
    if (!session) return null;

    let questions: IFamilyDialogueSessionQuestion[] = [];

    if (id === 1) {
      questions = [
        this.familyDialogueSessionQuestions[0],
        this.familyDialogueSessionQuestions[1],
        this.familyDialogueSessionQuestions[2]
      ];
    } else if (id === 4) {
      questions = [
        this.familyDialogueSessionQuestions[5],
        this.familyDialogueSessionQuestions[6],
        this.familyDialogueSessionQuestions[7]
      ];
    } else {
      questions = [
        this.familyDialogueSessionQuestions[3],
        this.familyDialogueSessionQuestions[4]
      ];
    }

    return {
      ...session,
      questions
    };
  }

  /**
   * Resource topic thumbnail mapping
   * Maps each resource topic to its default thumbnail image
   */
  static resourceTopicThumbnails = {
    [ResourceTopic.MUSIC]: 'assets/images/resources/music-1.jpg',
    [ResourceTopic.EDUCATION]: 'assets/images/resources/education-1.jpg',
    [ResourceTopic.SCIENCE]: 'assets/images/resources/science-1.jpg',
    [ResourceTopic.TECHNOLOGY]: 'assets/images/resources/technology-1.jpg',
    [ResourceTopic.ARTS]: 'assets/images/resources/arts-1.jpg',
    [ResourceTopic.SPORTS]: 'assets/images/resources/sports-1.jpg',
    [ResourceTopic.ALL]: 'assets/images/resources/default.jpg'
  };

  /**
   * Conflict level constants
   */
  static ConflictLevels = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    SEVERE: 'severe'
  };

  /**
   * Conflict level emojis
   */
  static ConflictLevelEmojis: Record<string, string> = {
    [ForceTestData.ConflictLevels.LOW]: '🟢',
    [ForceTestData.ConflictLevels.MEDIUM]: '🟡',
    [ForceTestData.ConflictLevels.HIGH]: '🟠',
    [ForceTestData.ConflictLevels.SEVERE]: '🔴'
  };

  /**
   * Get conflict level emoji
   * @param conflictLevel Conflict level
   * @returns Emoji for the conflict level
   */
  static getConflictLevelEmoji(conflictLevel: string): string {
    return ForceTestData.ConflictLevelEmojis[conflictLevel] || '🟢';
  }

  /**
   * Get feedback based on conflict score
   * @param score Conflict score
   * @returns Feedback text
   */
  static getFeedbackForConflictScore(score: number): string {
    if (score <= 20) {
      return 'Mức độ xung đột trong gia đình bạn rất thấp. Đây là một môi trường gia đình lành mạnh và hỗ trợ. Hãy tiếp tục duy trì mối quan hệ tốt đẹp này.';
    } else if (score <= 40) {
      return 'Mức độ xung đột trong gia đình bạn ở mức thấp. Gia đình bạn có nền tảng giao tiếp tốt, nhưng vẫn có thể cải thiện thêm để giải quyết các mâu thuẫn hiệu quả hơn.';
    } else if (score <= 60) {
      return 'Mức độ xung đột trong gia đình bạn ở mức trung bình. Có một số vấn đề cần được giải quyết. Hãy thử cải thiện kỹ năng giao tiếp và lắng nghe trong gia đình.';
    } else if (score <= 80) {
      return 'Mức độ xung đột trong gia đình bạn ở mức cao. Có nhiều vấn đề cần được giải quyết. Hãy cân nhắc tìm kiếm sự hỗ trợ từ người thân hoặc chuyên gia tư vấn gia đình.';
    } else {
      return 'Mức độ xung đột trong gia đình bạn ở mức nghiêm trọng. Đây là tình trạng đáng lo ngại. Hãy tìm kiếm sự hỗ trợ từ chuyên gia tư vấn gia đình hoặc nhà tâm lý học càng sớm càng tốt.';
    }
  }

  /**
   * Get conflict level based on score
   * @param score Conflict score
   * @returns Conflict level
   */
  static getConflictLevelFromScore(score: number): string {
    if (score <= 20) {
      return ForceTestData.ConflictLevels.LOW;
    } else if (score <= 50) {
      return ForceTestData.ConflictLevels.MEDIUM;
    } else if (score <= 80) {
      return ForceTestData.ConflictLevels.HIGH;
    } else {
      return ForceTestData.ConflictLevels.SEVERE;
    }
  }

  /**
   * Get result text based on conflict level
   * @param conflictLevel Conflict level
   * @returns Result text
   */
  static getResultTextFromConflictLevel(conflictLevel: string): string {
    switch (conflictLevel) {
      case ForceTestData.ConflictLevels.LOW:
        return 'Mức độ xung đột thấp';
      case ForceTestData.ConflictLevels.MEDIUM:
        return 'Mức độ xung đột trung bình';
      case ForceTestData.ConflictLevels.HIGH:
        return 'Mức độ xung đột cao';
      case ForceTestData.ConflictLevels.SEVERE:
        return 'Mức độ xung đột nghiêm trọng';
      default:
        return 'Mức độ xung đột không xác định';
    }
  }

  // Original ForceTestData content starts here

  static loginResult = { result: 1 };

  static authData: IAuthData = {
    id: 1,
    login: '0964164434',
    name: 'Phạm Bá Việt',
    is_teenager: true,
    is_parent: false,
    is_teacher: false,
    nickname: 'Sóc nâu',
    phone: '0964164434',
    email: 'viet220994@gmail.com',
    dob: '1994-09-22'
  };

  /**
   * Tasks detail
   */
  static tasksDetail = {
    id: 1,
    name: 'Nhiệm vụ 1',
    questions: [
      {
        text: 'Tôi có thể thảo luận về niềm tin của mình với mẹ/cha mà không cảm thấy bị gò bó hay xấu hổ.',
        options: [
          { text: 'Đúng', selected: true },
          { text: 'Tôi thấy hơi xấu hổ', selected: false },
        ],
      },
      {
        text: 'Đôi khi tôi gặp khó khăn trong việc tin vào mọi điều mẹ/cha nói với tôi.',
        options: [
          { text: 'Đúng', selected: false },
          { text: 'Không đúng', selected: true },
          { text: 'Tôi không rõ', selected: false },
        ],
      },
      {
        text: 'Mẹ/cha tôi luôn là người biết lắng nghe.',
        options: [
          { text: 'Đúng', selected: true },
          { text: 'Không đúng', selected: false },
        ],
      },
      {
        text: 'Mẹ/cha tôi luôn là người không biết lắng nghe.',
        options: [
          { text: 'Đúng', selected: false },
          { text: 'Không đúng', selected: false },
        ],
      },
    ],
  };

  /**
   * Mock user for shared entries in personal diary
   */
  static mockDiaryUser: IAuthData = {
    id: 2,
    name: 'Bạn lớp 6A',
    nickname: 'Bạn lớp 6A',
    login: 'student2',
    is_teenager: true,
    is_parent: false,
    is_teacher: false,
    avatar_512: 'assets/icons/svg/avatar.svg',
  };

  /**
   * Mock diary entries for personal diary
   */
  static personalDiaryEntries: IPersonalDiaryEntry[] = [
    {
      id: 1,
      user: this.authData,
      content: 'Hôm nay mình cảm thấy vui vì đã hoàn thành bài tập về nhà sớm.',
      emotionType: EmotionType.HAPPY,
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isAnonymous: false,
      isPublic: true,
      likes: 5,
      reactions: {
        love: 3,
        happy: 2,
        sad: 0,
        angry: 0,
      },
      userReactions: [
        { userId: 2, reactionType: 'love' },
        { userId: 3, reactionType: 'love' },
        { userId: 4, reactionType: 'love' },
        { userId: 5, reactionType: 'happy' },
        { userId: 6, reactionType: 'happy' },
      ],
    },
    {
      id: 2,
      user: this.mockDiaryUser,
      content:
        'Mình đang lo lắng về bài kiểm tra ngày mai. Mình chưa ôn tập đủ.',
      emotionType: EmotionType.ANXIOUS,
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      isAnonymous: false,
      isPublic: true,
      likes: 3,
      reactions: {
        love: 1,
        happy: 0,
        sad: 2,
        angry: 0,
      },
      userReactions: [
        { userId: 1, reactionType: 'sad' },
        { userId: 3, reactionType: 'sad' },
        { userId: 5, reactionType: 'love' },
      ],
    },
    {
      id: 3,
      user: this.authData,
      content: 'Mình cảm thấy buồn vì đã làm mất cuốn sách yêu thích.',
      emotionType: EmotionType.SAD,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isAnonymous: false,
      isPublic: false,
      likes: 0
    },
    {
      id: 4,
      user: this.mockDiaryUser,
      content:
        'Mình rất tức giận vì bạn trong nhóm không hoàn thành phần việc của mình.',
      emotionType: EmotionType.ANGRY,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      isAnonymous: true,
      isPublic: true,
      likes: 7,
      reactions: {
        love: 2,
        happy: 0,
        sad: 1,
        angry: 4,
      },
      userReactions: [
        { userId: 1, reactionType: 'angry' },
        { userId: 3, reactionType: 'angry' },
        { userId: 5, reactionType: 'angry' },
        { userId: 6, reactionType: 'angry' },
        { userId: 7, reactionType: 'love' },
        { userId: 8, reactionType: 'love' },
        { userId: 9, reactionType: 'sad' },
      ],
    },
    {
      id: 5,
      user: this.authData,
      content: 'Mình rất phấn khích vì sắp được đi dã ngoại cùng lớp!',
      emotionType: EmotionType.EXCITED,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isAnonymous: false,
      isPublic: true,
      likes: 10,
    },
  ];

  /**
   * Mock emotion suggestions for personal diary
   */
  static emotionSuggestions: IEmotionSuggestion[] = [
    {
      id: 1,
      emotionType: EmotionType.HAPPY,
      suggestions: [
        'Chia sẻ niềm vui với bạn bè',
        'Viết nhật ký về những điều tích cực',
        'Tận hưởng cảm xúc vui vẻ này'
      ]
    },
    {
      id: 2,
      emotionType: EmotionType.SAD,
      suggestions: [
        'Nói chuyện với người thân hoặc bạn bè',
        'Nghe nhạc thư giãn',
        'Viết ra cảm xúc của bạn',
        'Tập thể dục nhẹ nhàng'
      ]
    },
    {
      id: 3,
      emotionType: EmotionType.ANGRY,
      suggestions: [
        'Hít thở sâu và đếm đến 10',
        'Viết ra điều khiến bạn tức giận',
        'Tập thể dục để giải tỏa năng lượng tiêu cực',
        'Nói chuyện với người bạn tin tưởng'
      ]
    },
    {
      id: 4,
      emotionType: EmotionType.ANXIOUS,
      suggestions: [
        'Thực hành các bài tập thở sâu',
        'Tập trung vào hiện tại',
        'Chia sẻ lo lắng với người lớn',
        'Viết ra những điều bạn lo lắng'
      ]
    },
    {
      id: 5,
      emotionType: EmotionType.EXCITED,
      suggestions: [
        'Chia sẻ niềm vui với bạn bè',
        'Lập kế hoạch cho những điều thú vị',
        'Ghi lại cảm xúc trong nhật ký'
      ]
    },
    {
      id: 6,
      emotionType: EmotionType.TIRED,
      suggestions: [
        'Nghỉ ngơi đầy đủ',
        'Uống nhiều nước',
        'Đi ngủ sớm hơn',
        'Tập thể dục nhẹ nhàng'
      ]
    },
    {
      id: 7,
      emotionType: EmotionType.CALM,
      suggestions: [
        'Thực hành thiền định',
        'Đọc sách yêu thích',
        'Dành thời gian cho sở thích'
      ]
    },
    {
      id: 8,
      emotionType: EmotionType.CONFUSED,
      suggestions: [
        'Viết ra những điều bạn đang băn khoăn',
        'Nói chuyện với giáo viên hoặc phụ huynh',
        'Chia nhỏ vấn đề để giải quyết từng phần'
      ]
    }
  ];


  /**
   * Resources data (documents and videos)
   */
  static resources: Array<IResource> = [
    {
      id: 1,
      title: 'A Whole New World',
      description: 'Bài hát nổi tiếng từ phim hoạt hình Aladdin của Disney, thể hiện bởi ca sĩ Âu Mỹ.',
      shortDescription: 'Bài hát nổi tiếng từ phim Aladdin',
      resourceUrl: 'https://www.youtube.com/embed/hZ1Rb9hC4JY',
      thumbnailUrl: 'https://img.youtube.com/vi/hZ1Rb9hC4JY/hqdefault.jpg',
      type: ResourceType.VIDEO,
      topic: ResourceTopic.MUSIC,
      isExternal: true,
      viewCount: 120,
      createdDate: '2023-05-15'
    },
    {
      id: 2,
      title: 'Thích quá rùi nà',
      description: 'Video cover bài hát "Thích quá rùi nà" được thể hiện bởi nhiều ca sĩ trẻ Việt Nam.',
      shortDescription: 'Cover bài hát "Thích quá rùi nà"',
      resourceUrl: 'https://www.youtube.com/embed/HZi4eJXWZU0',
      thumbnailUrl: 'https://img.youtube.com/vi/HZi4eJXWZU0/hqdefault.jpg',
      type: ResourceType.VIDEO,
      topic: ResourceTopic.MUSIC,
      isExternal: true,
      viewCount: 85,
      createdDate: '2023-06-20'
    },
    {
      id: 3,
      title: 'Chuyện gì sẽ xảy ra nếu bạn không uống nước?',
      description: 'Video giải thích khoa học về tầm quan trọng của nước đối với cơ thể con người và những hậu quả nếu không uống đủ nước.',
      shortDescription: 'Tầm quan trọng của nước với cơ thể',
      resourceUrl: 'https://www.youtube.com/embed/9iMGFqMmUFs',
      thumbnailUrl: 'https://img.youtube.com/vi/9iMGFqMmUFs/hqdefault.jpg',
      type: ResourceType.VIDEO,
      topic: ResourceTopic.SCIENCE,
      isExternal: true,
      viewCount: 210,
      createdDate: '2023-04-10'
    },
    {
      id: 4,
      title: 'Tại sao mèo lại hành xử kỳ lạ đến vậy?',
      description: 'Video khám phá hành vi của loài mèo và giải thích khoa học đằng sau những hành động kỳ lạ của chúng.',
      shortDescription: 'Khám phá hành vi của loài mèo',
      resourceUrl: 'https://www.youtube.com/embed/Z-QsJGDR9nU',
      thumbnailUrl: 'https://img.youtube.com/vi/Z-QsJGDR9nU/hqdefault.jpg',
      type: ResourceType.VIDEO,
      topic: ResourceTopic.SCIENCE,
      isExternal: true,
      viewCount: 175,
      createdDate: '2023-07-05'
    },
    {
      id: 5,
      title: 'Hướng dẫn học tập hiệu quả',
      description: 'Tài liệu PDF cung cấp các phương pháp học tập hiệu quả, kỹ thuật ghi nhớ và quản lý thời gian cho học sinh.',
      shortDescription: 'Phương pháp học tập hiệu quả',
      resourceUrl: 'assets/documents/huong-dan-hoc-tap-hieu-qua.pdf',
      thumbnailUrl: 'https://img.youtube.com/vi/hZ1Rb9hC4JY/hqdefault.jpg',
      type: ResourceType.DOCUMENT,
      topic: ResourceTopic.EDUCATION,
      fileType: 'pdf',
      viewCount: 320,
      createdDate: '2023-03-15'
    },
    {
      id: 6,
      title: 'Kỹ năng giao tiếp cơ bản',
      description: 'Tài liệu hướng dẫn các kỹ năng giao tiếp cơ bản, cách thể hiện bản thân và xây dựng mối quan hệ tốt với mọi người.',
      shortDescription: 'Hướng dẫn kỹ năng giao tiếp',
      resourceUrl: 'assets/documents/ky-nang-giao-tiep.pdf',
      thumbnailUrl: 'https://img.youtube.com/vi/hZ1Rb9hC4JY/hqdefault.jpg',
      type: ResourceType.DOCUMENT,
      topic: ResourceTopic.EDUCATION,
      fileType: 'pdf',
      viewCount: 280,
      createdDate: '2023-02-28'
    },
    {
      id: 7,
      title: 'Giới thiệu về Trí tuệ nhân tạo',
      description: 'Tài liệu giới thiệu cơ bản về trí tuệ nhân tạo, lịch sử phát triển và các ứng dụng trong cuộc sống hiện đại.',
      shortDescription: 'Giới thiệu về AI',
      resourceUrl: 'assets/documents/gioi-thieu-tri-tue-nhan-tao.pdf',
      thumbnailUrl: 'https://img.youtube.com/vi/hZ1Rb9hC4JY/hqdefault.jpg',
      type: ResourceType.DOCUMENT,
      topic: ResourceTopic.TECHNOLOGY,
      fileType: 'pdf',
      viewCount: 195,
      createdDate: '2023-05-20'
    },
    {
      id: 8,
      title: 'Hướng dẫn vẽ tranh cơ bản',
      description: 'Tài liệu hướng dẫn các kỹ thuật vẽ tranh cơ bản cho người mới bắt đầu, từ phác thảo đến tô màu.',
      shortDescription: 'Kỹ thuật vẽ tranh cơ bản',
      resourceUrl: 'assets/documents/huong-dan-ve-tranh.pdf',
      thumbnailUrl: 'https://img.youtube.com/vi/hZ1Rb9hC4JY/hqdefault.jpg',
      type: ResourceType.DOCUMENT,
      topic: ResourceTopic.ARTS,
      fileType: 'pdf',
      viewCount: 150,
      createdDate: '2023-06-10'
    },
    {
      id: 9,
      title: 'Các bài tập thể dục tại nhà',
      description: 'Tài liệu hướng dẫn các bài tập thể dục đơn giản có thể thực hiện tại nhà mà không cần dụng cụ phức tạp.',
      shortDescription: 'Bài tập thể dục tại nhà',
      resourceUrl: 'assets/documents/bai-tap-the-duc.pdf',
      thumbnailUrl: 'https://img.youtube.com/vi/hZ1Rb9hC4JY/hqdefault.jpg',
      type: ResourceType.DOCUMENT,
      topic: ResourceTopic.SPORTS,
      fileType: 'pdf',
      viewCount: 230,
      createdDate: '2023-04-25'
    },
    {
      id: 10,
      title: 'Lập trình web cơ bản',
      description: 'Video hướng dẫn lập trình web cơ bản với HTML, CSS và JavaScript cho người mới bắt đầu.',
      shortDescription: 'Hướng dẫn lập trình web',
      resourceUrl: 'https://www.youtube.com/embed/zJSY8tbf_ys',
      thumbnailUrl: 'https://img.youtube.com/vi/zJSY8tbf_ys/hqdefault.jpg',
      type: ResourceType.VIDEO,
      topic: ResourceTopic.TECHNOLOGY,
      isExternal: true,
      viewCount: 310,
      createdDate: '2023-03-30',
    },
  ];

  /**
   * Classes data for teacher
   */
  static classes: ILiyYdmsClass[] = [
    {
      id: 1,
      name: 'Lớp 6A',
      code: '6A-2024',
      teacher_id: { id: 1, name: 'Nguyễn Thị Lan' },
      grade: 'Khối 6',
      academic_year: '2024-2025',
      student_count: 25,
      student_ids: [1, 2, 3, 4, 5],
      description: 'Lớp học chính khóa 6A năm học 2024-2025',
      active: true,
      create_date: '2024-09-01 08:00:00',
      write_date: '2024-09-01 08:00:00'
    },
    {
      id: 2,
      name: 'Lớp 6B',
      code: '6B-2024',
      teacher_id: { id: 1, name: 'Nguyễn Thị Lan' },
      grade: 'Khối 6',
      academic_year: '2024-2025',
      student_count: 28,
      student_ids: [6, 7, 8, 9, 10],
      description: 'Lớp học chính khóa 6B năm học 2024-2025',
      active: true,
      create_date: '2024-09-01 08:00:00',
      write_date: '2024-09-01 08:00:00'
    },
    {
      id: 3,
      name: 'Lớp 7A',
      code: '7A-2024',
      teacher_id: { id: 1, name: 'Nguyễn Thị Lan' },
      grade: 'Khối 7',
      academic_year: '2024-2025',
      student_count: 30,
      student_ids: [11, 12, 13, 14, 15],
      description: 'Lớp học chính khóa 7A năm học 2024-2025',
      active: true,
      create_date: '2024-09-01 08:00:00',
      write_date: '2024-09-01 08:00:00'
    }
  ];

  /**
   * Students data
   */
  static students: ILiyYdmsStudent[] = [
    {
      id: 1,
      user_id: { id: 101, name: 'Nguyễn Văn An' },
      name: 'Nguyễn Văn An',
      avatar: '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      nickname: 'An',
      email: 'an.nguyen@email.com',
      phone: '0123456789',
      class_id: { id: 1, name: 'Lớp 6A' },
      student_code: 'HS001',
      dob: '2012-03-15',
      gender: 'male',
      total_score: 85,
      class_rank: 3,
      active: true,
      create_date: '2024-09-01 08:00:00',
      write_date: '2024-09-01 08:00:00'
    },
    {
      id: 2,
      user_id: { id: 102, name: 'Trần Thị Bình' },
      name: 'Trần Thị Bình',
      avatar: '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      nickname: 'Bình',
      email: 'binh.tran@email.com',
      phone: '0123456790',
      class_id: { id: 1, name: 'Lớp 6A' },
      student_code: 'HS002',
      dob: '2012-05-20',
      gender: 'female',
      total_score: 92,
      class_rank: 1,
      active: true,
      create_date: '2024-09-01 08:00:00',
      write_date: '2024-09-01 08:00:00'
    },
    {
      id: 3,
      user_id: { id: 103, name: 'Lê Văn Cường' },
      name: 'Lê Văn Cường',
      avatar: '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      nickname: 'Cường',
      email: 'cuong.le@email.com',
      phone: '0123456791',
      class_id: { id: 1, name: 'Lớp 6A' },
      student_code: 'HS003',
      dob: '2012-01-10',
      gender: 'male',
      total_score: 78,
      class_rank: 5,
      active: true,
      create_date: '2024-09-01 08:00:00',
      write_date: '2024-09-01 08:00:00'
    },
    {
      id: 4,
      user_id: { id: 104, name: 'Phạm Thị Dung' },
      name: 'Phạm Thị Dung',
      avatar: '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      nickname: 'Dung',
      email: 'dung.pham@email.com',
      phone: '0123456792',
      class_id: { id: 1, name: 'Lớp 6A' },
      student_code: 'HS004',
      dob: '2012-07-25',
      gender: 'female',
      total_score: 88,
      class_rank: 2,
      active: true,
      create_date: '2024-09-01 08:00:00',
      write_date: '2024-09-01 08:00:00'
    },
    {
      id: 5,
      user_id: { id: 105, name: 'Hoàng Văn Em' },
      name: 'Hoàng Văn Em',
      avatar: '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      nickname: 'Em',
      email: 'em.hoang@email.com',
      phone: '0123456793',
      class_id: { id: 1, name: 'Lớp 6A' },
      student_code: 'HS005',
      dob: '2012-11-30',
      gender: 'male',
      total_score: 82,
      class_rank: 4,
      active: true,
      create_date: '2024-09-01 08:00:00',
      write_date: '2024-09-01 08:00:00'
    }
  ];

}
