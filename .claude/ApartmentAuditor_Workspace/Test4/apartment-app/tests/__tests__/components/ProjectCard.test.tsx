import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { ProjectCard } from '../../../components/features/ProjectCard';
import type { Project } from '../../../types/database';

// Mock all external dependencies
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  StyleSheet: {
    create: jest.fn(() => ({})),
  },
}));

jest.mock('@expo/vector-icons', () => 'Ionicons');

jest.mock('../../../components/ui/ProgressBar', () => 'ProgressBar');

jest.mock('../../../constants/colors', () => ({
  defaultColors: {
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    primary: '#007AFF',
    background: '#F5F5F5',
  },
  getStatusColor: jest.fn(() => '#666666'),
  SIZES: {
    borderRadius: {
      lg: 12,
      round: 16,
    },
    padding: {
      md: 16,
    },
    margin: {
      sm: 8,
      xs: 4,
    },
    shadow: {
      sm: {},
    },
  },
  TEXT_STYLES: {
    body: {
      fontSize: 16,
    },
    bodySmall: {
      fontSize: 14,
    },
    caption: {
      fontSize: 12,
    },
  },
}));

describe('ProjectCard', () => {
  const mockOnPress = jest.fn();

  // Helper to create test project
  const createTestProject = (overrides: Partial<Project> = {}): Project => ({
    id: 'test-project-1',
    title: 'Test Apartment',
    createdAt: Date.now() - 86400000, // 1 day ago
    updatedAt: Date.now(),
    finishMode: 'draft',
    isActive: true,
    isArchived: false,
    address: '123 Test Street, Test City',
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const project = createTestProject();

    expect(() => {
      render(
        <ProjectCard project={project} onPress={mockOnPress} />
      );
    }).not.toThrow();
  });

  it('displays project title', () => {
    const project = createTestProject({ title: 'Luxury Penthouse' });

    const { getByText } = render(
      <ProjectCard project={project} onPress={mockOnPress} />
    );

    expect(getByText('Luxury Penthouse')).toBeTruthy();
  });

  it('displays creation date', () => {
    const fixedDate = new Date('2024-03-15T10:00:00Z');
    const project = createTestProject({
      createdAt: fixedDate.getTime(),
      title: 'Test Project'
    });

    const { getByText } = render(
      <ProjectCard project={project} onPress={mockOnPress} />
    );

    expect(getByText('15.03.2024')).toBeTruthy();
  });

  it('displays address when provided', () => {
    const project = createTestProject({
      address: 'ул. Примерная, д. 123, кв. 45'
    });

    const { getByText } = render(
      <ProjectCard project={project} onPress={mockOnPress} />
    );

    expect(getByText('ул. Примерная, д. 123, кв. 45')).toBeTruthy();
  });

  it('does not display address when not provided', () => {
    const project = createTestProject({ address: undefined });

    const { queryByText } = render(
      <ProjectCard project={project} onPress={mockOnPress} />
    );

    expect(queryByText('123 Test Street, Test City')).toBeFalsy();
  });

  it('shows progress text', () => {
    const project = createTestProject();

    const { getByText } = render(
      <ProjectCard project={project} onPress={mockOnPress} />
    );

    expect(getByText('0% завершено')).toBeTruthy();
  });

  it('does not show progress when showProgress is false', () => {
    const project = createTestProject();

    const { queryByText } = render(
      <ProjectCard project={project} onPress={mockOnPress} showProgress={false} />
    );

    expect(queryByText('% завершено')).toBeFalsy();
  });

  it('handles press events', () => {
    const project = createTestProject();

    const { getByTestId } = render(
      <ProjectCard project={project} onPress={mockOnPress} />
    );

    const touchable = getByTestId('project-card-touchable');
    fireEvent.press(touchable);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('handles empty title', () => {
    const project = createTestProject({ title: '' });

    const { getByText } = render(
      <ProjectCard project={project} onPress={mockOnPress} />
    );

    expect(getByText('')).toBeTruthy();
  });

  it('handles very long title', () => {
    const veryLongTitle = 'A'.repeat(200);
    const project = createTestProject({ title: veryLongTitle });

    const { getByText } = render(
      <ProjectCard project={project} onPress={mockOnPress} />
    );

    expect(getByText(veryLongTitle)).toBeTruthy();
  });

  it('handles special characters in title', () => {
    const specialTitle = 'Квартира №123 "Супер-Люкс" @ МКАД';
    const project = createTestProject({ title: specialTitle });

    const { getByText } = render(
      <ProjectCard project={project} onPress={mockOnPress} />
    );

    expect(getByText(specialTitle)).toBeTruthy();
  });

  it('has TouchableOpacity with correct testID', () => {
    const project = createTestProject();

    const { getByTestId } = render(
      <ProjectCard project={project} onPress={mockOnPress} />
    );

    expect(getByTestId('project-card-touchable')).toBeTruthy();
  });

  it('has TouchableOpacity with activeOpacity', () => {
    const project = createTestProject();

    const { getByTestId } = render(
      <ProjectCard project={project} onPress={mockOnPress} />
    );

    const touchable = getByTestId('project-card-touchable');
    expect(touchable.props.activeOpacity).toBe(0.7);
  });

  it('renders without address for minimal project', () => {
    const minimalProject: Project = {
      id: 'minimal',
      title: 'Minimal Project',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      finishMode: 'draft',
      isActive: true,
      isArchived: false,
    };

    const { getByText, queryByText } = render(
      <ProjectCard project={minimalProject} onPress={mockOnPress} />
    );

    expect(getByText('Minimal Project')).toBeTruthy();
    expect(queryByText('ул. Примерная')).toBeFalsy();
  });

  it('handles project with special characters in address', () => {
    const specialAddress = 'ул. "Победы", д. №45А, корп. 2Б';
    const project = createTestProject({ address: specialAddress });

    const { getByText } = render(
      <ProjectCard project={project} onPress={mockOnPress} />
    );

    expect(getByText(specialAddress)).toBeTruthy();
  });
});