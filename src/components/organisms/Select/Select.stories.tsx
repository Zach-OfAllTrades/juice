import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { InputStack } from '../../molecules/InputStack';
import { Select } from './Select';

const meta = {
  title: 'Organisms/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const frameworkOptions = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'SolidJS' },
  { value: 'angular', label: 'Angular', disabled: true },
];

export const Default: Story = {
  args: {
    label: 'Frontend Framework',
    placeholder: 'Pick a framework',
    options: frameworkOptions,
    defaultValue: 'react',
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Select {...args} />
    </div>
  ),
};

export const GroupedOptions: Story = {
  args: {
    label: 'Deployment Target',
    placeholder: 'Select a platform',
    options: [
      {
        group: 'Cloud Hosting',
        options: [
          { value: 'vercel', label: 'Vercel' },
          { value: 'netlify', label: 'Netlify' },
          { value: 'cloudflare', label: 'Cloudflare Pages' },
        ],
      },
      {
        group: 'Cloud Providers',
        options: [
          { value: 'aws', label: 'Amazon Web Services' },
          { value: 'gcp', label: 'Google Cloud Platform' },
          { value: 'azure', label: 'Microsoft Azure' },
        ],
      },
    ],
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Select {...args} />
    </div>
  ),
};

export const WithError: Story = {
  args: {
    label: 'Country / Region',
    placeholder: 'Select country',
    error: 'Please select a supported shipping region.',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'ca', label: 'Canada' },
      { value: 'uk', label: 'United Kingdom' },
    ],
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Select {...args} />
    </div>
  ),
};

export const ControlledState: Story = {
  args: {},
  render: () => {
    const [val, setVal] = useState('react');

    return (
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ fontSize: '0.875rem' }}>
          Current selected value: <strong>{val}</strong>
        </p>
        <Select
          label="Favorite Library"
          value={val}
          onValueChange={setVal}
          options={frameworkOptions}
        />
        <Button size="sm" variant="secondary" onClick={() => setVal('svelte')}>
          Set to Svelte programmatically
        </Button>
      </div>
    );
  },
};

export const InForm: Story = {
  args: {},
  render: () => (
    <form
      onSubmit={(e) => e.preventDefault()}
      style={{ width: 360, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      <InputStack>
        <Input label="Project Name" placeholder="juice-ui" required />
        <Select
          label="Framework"
          defaultValue="react"
          options={frameworkOptions}
          helperText="Selected ecosystem for component primitives."
        />
        <Input label="Author" placeholder="Zach Rose" />
      </InputStack>
      <Button type="submit" variant="primary" fullWidth>
        Save Configuration
      </Button>
    </form>
  ),
};

export const CompoundComposition: Story = {
  args: {},
  render: () => (
    <div style={{ width: 320 }}>
      <Select.Root defaultValue="dark">
        <Select.Trigger aria-label="Theme mode">
          <Select.Value placeholder="Select theme" />
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Label>Appearance</Select.Label>
            <Select.Item value="light">Light Mode</Select.Item>
            <Select.Item value="dark">Dark Mode</Select.Item>
            <Select.Item value="system">System Default</Select.Item>
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </div>
  ),
};
