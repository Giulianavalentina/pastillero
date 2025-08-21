import HomeScreen, { CustomText } from '@/app/index'; // Asegúrate de que esta línea esté correcta
import { render } from '@testing-library/react-native';

describe('<HomeScreen />', () => {
  test('Text renders correctly on HomeScreen', () => {
    const { getByText } = render(<HomeScreen />);
    getByText('Welcome!');
  });

  // Asegúrate de que el segundo test también esté presente si lo copiaste
  test('CustomText renders correctly', () => {
    const tree = render(<CustomText>Some text</CustomText>).toJSON();
    expect(tree).toMatchSnapshot();
  });
});