import {
  Anchor,
  Box,
  Button,
  ColorSwatch,
  createStyles,
  Group,
  MultiSelect,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  useMantineTheme,
} from '@mantine/core';
import { DatePicker, TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import React from 'react';
import { TimezoneItem, TimezoneValue, tzData } from './TimezoneSelect';
import { encode } from 'js-base64';
import { showNotification, updateNotification } from '@mantine/notifications';
import { useClipboard } from '@mantine/hooks';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { PaperPlaneIcon } from '@modulz/radix-icons';
dayjs.extend(utc);
dayjs.extend(timezone);

const useStyles = createStyles((theme) => ({
  FormContainer: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  MainFieldsWrapper: {
    display: 'flex',
    gap: '20px',
    [`@media (max-width: ${theme.breakpoints.md}px)`]: {
      flexDirection: 'column',
    },
  },
  FormSubmitBtn: {
    maxWidth: 'fit-content',
  },
}));

interface CreateFormProps {
  setPrimaryColor: (color: string) => void;
}

const CreateForm = ({ setPrimaryColor }: CreateFormProps) => {
  const { classes } = useStyles();
  const clipboard = useClipboard();
  const theme = useMantineTheme();

  const form = useForm({
    initialValues: {
      title: 'Robert Birthday 🎉',
      description:
        'Duis exercitation cupidatat aliquip reprehenderit officia consectetur ea pariatur reprehenderit minim consequat eu. Nulla non aliquip eu enim sit enim Lorem mollit eu enim aliquip eiusmod minim labore. Amet officia in sunt eu duis anim veniam officia esse id amet nisi. Tempor eu magna eiusmod fugiat. Adipisicing dolore ullamco tempor commodo veniam. Eiusmod voluptate exercitation ipsum in. Sunt exercitation deserunt tempor labore sunt nulla ullamco officia ut cillum qui sit mollit elit. Sit tempor exercitation mollit culpa. Exercitation velit exercitation nulla in anim quis duis tempor aute labore dolore nulla deserunt elit sit. Labore aliquip in duis irure ad quis aliquip do fugiat.',
      isRecurring: false,
      recurringFrequency: '',
      date: new Date('Wed Jun 30 2022 00:00:00 GMT+0530 (India Standard Time)'),
      time: new Date('Sun Jun 19 2022 00:00:00 GMT+0530 (India Standard Time)'),
      timezones: ['Asia/Kolkata', 'Asia/Bangkok', 'America/New_York', 'Europe/London'],
    },
    validate: {
      title: (value) => (value ? null : 'Title is required'),
      date: (value) => (value ? null : 'Date is required'),
      time: (value) => (value ? null : 'Time is required'),
      recurringFrequency: (value) => {
        if (form.values.isRecurring) {
          return value ? null : 'Recurring frequency is required';
        }
        return null;
      },
    },
  });

  const handleFormSubmit = async (values: any) => {
    const data = {
      ...values,
      primaryColor: theme.primaryColor,
      creatorTimezone: dayjs.tz.guess().replace('Calcutta', 'Kolkata'),
    };

    const dataString = JSON.stringify(data);
    const dataBase64 = encode(dataString);
    showNotification({
      id: 'share-link',
      title: 'Generating Share Link',
      message: `Please wait while we generate your share link.`,
      loading: true,
      autoClose: false,
      disallowClose: true,
    });
    const longURL = `${window.location.origin}/share?data=${dataBase64}`;
    try {
      const result = await fetch(`https://tinyurl.com/api-create.php?url=${longURL}`);
      const shortURL = await result.text();
      clipboard.copy(shortURL);
      updateNotification({
        id: 'share-link',
        title: 'Share Link Generated',
        message: (
          <Text>
            Your share link is: <Anchor href={shortURL}>{shortURL}</Anchor>
          </Text>
        ),
        autoClose: true,
        disallowClose: false,
      });
    } catch (e) {
      clipboard.copy(longURL);
      updateNotification({
        id: 'share-link',
        title: 'Share Link Generated',
        message: `Link Copied to Clipboard`,
        autoClose: true,
        disallowClose: false,
      });
    }
  };

  const swatches = Object.keys(theme.colors)
    .filter((c) => c !== 'dark')
    .reverse()
    .map((color) => (
      <ColorSwatch
        onClick={() => setPrimaryColor(color)}
        key={color}
        radius={0}
        sx={{
          cursor: 'pointer',
        }}
        color={theme.colors[color][6]}
      >
        {theme.primaryColor === color ? (
          <Box
            sx={{
              width: '60%',
              height: '60%',
              backgroundColor: theme.colors[color][9],
            }}
          />
        ) : null}
      </ColorSwatch>
    ));

  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
      <Stack className={classes.FormContainer}>
        <Box className={classes.MainFieldsWrapper}>
          <Stack sx={{ flex: 1 }}>
            <TextInput
              {...form.getInputProps('title')}
              placeholder="Enter Title"
              size="md"
              radius={0}
              label="Event name"
            />
            <Switch {...form.getInputProps('isRecurring')} label="Recurring Event" radius={0} />
            <DatePicker
              {...form.getInputProps('date')}
              label="Event Date"
              placeholder="Select Date"
              size="md"
              radius={0}
            />
            {form.values.isRecurring && (
              <Select
                {...form.getInputProps('recurringFrequency')}
                data={['Every Day', 'Alternate Days', 'Every Weak', 'Every Month', 'Every Year']}
                label="Recurring Frequency"
                placeholder="Select Frequency"
                size="md"
                radius={0}
              />
            )}
            <TimeInput
              {...form.getInputProps('time')}
              size="md"
              radius={0}
              label="Event Time"
              clearable
              format="12"
            />
          </Stack>
          <Stack>
            <Textarea
              {...form.getInputProps('description')}
              sx={{ flex: 1, minWidth: '30vw' }}
              label="Description"
              placeholder="Enter description of the event"
              size="md"
              radius={0}
              minRows={8}
            />
            <Stack spacing={2} sx={{ maxWidth: '500px' }}>
              <label>Color Scheme</label>
              <Group mt={3} spacing={10}>
                {swatches}
              </Group>
            </Stack>
          </Stack>
        </Box>
        <MultiSelect
          {...form.getInputProps('timezones')}
          data={tzData}
          label="Select Timezones"
          description="Time converted to these timezones will be present on share page along with user's time zone"
          size="md"
          radius={0}
          searchable
          valueComponent={TimezoneValue}
          itemComponent={TimezoneItem}
          styles={{
            dropdown: {
              maxWidth: '400px',
            },
          }}
        />
        <Button
          type="submit"
          className={classes.FormSubmitBtn}
          rightIcon={<PaperPlaneIcon />}
          size="md"
          radius={0}
        >
          Create Event
        </Button>
      </Stack>
    </form>
  );
};

export default CreateForm;
