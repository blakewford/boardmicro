void top();
void middle();
void bottom();

int main()
{
loop:
    bottom();
    goto loop;
    return 0;
}

void bottom()
{
  middle();
}

void middle()
{
  top();
}

void top()
{
}

